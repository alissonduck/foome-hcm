/**
 * API para gerenciamento de membros de uma subequipe
 * Implementa rotas para adicionar membros à subequipe
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { subteamMemberSchema } from "@/lib/schemas/team-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
    subteamId: string
  }
}

/**
 * Adiciona um membro a uma subequipe
 * 
 * @param request Objeto de requisição com dados do membro
 * @param params Parâmetros da rota, incluindo o ID da equipe e da subequipe
 * @returns Status de sucesso ou erro
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, subteamId } = params
    
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
        { error: "Apenas administradores podem adicionar membros a subequipes" },
        { status: 403 }
      )
    }

    // Obtém a equipe para verificar se ela existe e pertence à empresa
    try {
      const team = await TeamService.getTeamWithMembers(id)
      
      // Verifica se a equipe pertence à empresa do usuário
      if (team.company_id !== company.id) {
        return NextResponse.json(
          { error: "Acesso negado" },
          { status: 403 }
        )
      }
      
      // Verifica se a subequipe pertence à equipe
      const subteamBelongsToTeam = team.subteams.some(subteam => subteam.id === subteamId);
      if (!subteamBelongsToTeam) {
        return NextResponse.json(
          { error: "Subequipe não pertence à equipe especificada" },
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
    const validationResult = subteamMemberSchema.safeParse({
      ...body,
      subteam_id: subteamId,
      added_by: company.userId,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Verifica se o funcionário é membro da equipe principal
    try {
      const team = await TeamService.getTeamWithMembers(id)
      const isTeamMember = team.members.some(
        member => member.id === validationResult.data.employee_id
      )

      if (!isTeamMember) {
        return NextResponse.json(
          { error: "O funcionário deve ser membro da equipe principal para ser adicionado à subequipe" },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Erro ao verificar se o funcionário é membro da equipe" },
        { status: 500 }
      )
    }

    // Adiciona o membro à subequipe
    await TeamService.addSubteamMember(validationResult.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SUBTEAM_MEMBER_POST]", error)
    return NextResponse.json(
      { error: "Erro ao adicionar membro à subequipe" },
      { status: 500 }
    )
  }
} 