/**
 * API para gerenciamento de subequipes
 * Implementa rotas para listar e criar subequipes
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { subteamCreateSchema } from "@/lib/schemas/team-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Obtém todas as subequipes de uma equipe
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe principal
 * @returns Lista de subequipes
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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
      
      // As subequipes já estão incluídas no resultado de getTeamWithMembers
      return NextResponse.json(team.subteams)
    } catch (error) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("[SUBTEAMS_GET]", error)
    return NextResponse.json(
      { error: "Erro ao obter subequipes" },
      { status: 500 }
    )
  }
}

/**
 * Cria uma nova subequipe
 * 
 * @param request Objeto de requisição com dados da subequipe
 * @param params Parâmetros da rota, incluindo o ID da equipe principal
 * @returns Subequipe criada
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
        { error: "Apenas administradores podem criar subequipes" },
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
    const validationResult = subteamCreateSchema.safeParse({
      ...body,
      team_id: id,
      created_by: company.userId,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Cria a subequipe
    const subteam = await TeamService.createSubteam(validationResult.data)

    return NextResponse.json(subteam)
  } catch (error) {
    console.error("[SUBTEAMS_POST]", error)
    return NextResponse.json(
      { error: "Erro ao criar subequipe" },
      { status: 500 }
    )
  }
} 