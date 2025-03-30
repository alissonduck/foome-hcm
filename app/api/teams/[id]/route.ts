/**
 * API para gerenciamento de equipe específica
 * Implementa rotas para obter, atualizar e excluir uma equipe
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { teamUpdateSchema } from "@/lib/schemas/team-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Obtém os detalhes de uma equipe específica
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe
 * @returns Detalhes da equipe com membros e subequipes
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

    // Obtém a equipe
    try {
      const team = await TeamService.getTeamWithMembers(id)
      
      // Verifica se a equipe pertence à empresa do usuário
      if (team.company_id !== company.id) {
        return NextResponse.json(
          { error: "Acesso negado" },
          { status: 403 }
        )
      }
      
      return NextResponse.json(team)
    } catch (error) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("[TEAM_GET]", error)
    return NextResponse.json(
      { error: "Erro ao buscar equipe" },
      { status: 500 }
    )
  }
}

/**
 * Atualiza uma equipe existente
 * 
 * @param request Objeto de requisição com dados atualizados da equipe
 * @param params Parâmetros da rota, incluindo o ID da equipe
 * @returns Equipe atualizada
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
        { error: "Apenas administradores podem atualizar equipes" },
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
    const validationResult = teamUpdateSchema.safeParse({
      ...body,
      updated_at: new Date().toISOString(),
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Atualiza a equipe
    const team = await TeamService.updateTeam(id, validationResult.data)

    return NextResponse.json(team)
  } catch (error) {
    console.error("[TEAM_PUT]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar equipe" },
      { status: 500 }
    )
  }
}

/**
 * Exclui uma equipe
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe
 * @returns Confirmação de exclusão
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
        { error: "Apenas administradores podem excluir equipes" },
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

    // Exclui a equipe
    await TeamService.deleteTeam(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEAM_DELETE]", error)
    return NextResponse.json(
      { error: "Erro ao excluir equipe" },
      { status: 500 }
    )
  }
} 