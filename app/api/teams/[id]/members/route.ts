/**
 * API para gerenciamento de membros de uma equipe
 * Implementa rotas para adicionar membros a uma equipe
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { teamMemberSchema } from "@/lib/schemas/team-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Adiciona um membro a uma equipe
 * 
 * @param request Objeto de requisição com dados do membro
 * @param params Parâmetros da rota, incluindo o ID da equipe
 * @returns Confirmação da adição
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Obtém o cliente atual autenticado
    const company = await getCurrentCompany()

    if (!company) {
      return NextResponse.json(
        { error: "Não autenticado ou empresa não encontrada" },
        { status: 401 }
      )
    }

    // Verifica se o usuário é administrador
    const supabase = await createClient()
    const currentUser = await isAdmin(supabase, company.userId)

    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem adicionar membros" },
        { status: 403 }
      )
    }

    // Obtém a equipe para verificar se ela existe e pertence à empresa
    try {
      const existingTeam = await TeamService.getTeamWithMembers(id)
      
      // Verifica se a equipe pertence à empresa do usuário
      if (existingTeam.company_id !== company.id) {
        return NextResponse.json(
          { error: "Acesso negado" },
          { status: 403 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }

    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = teamMemberSchema.safeParse({
      ...body,
      team_id: id,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Adiciona o membro à equipe
    await TeamService.addTeamMember(validationResult.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEAM_MEMBERS_POST]", error)
    return NextResponse.json(
      { error: "Erro ao adicionar membro à equipe" },
      { status: 500 }
    )
  }
} 