/**
 * API para gerenciamento de uma subequipe específica
 * Implementa rotas para obter, atualizar e excluir uma subequipe
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { subteamUpdateSchema } from "@/lib/schemas/team-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
    subteamId: string
  }
}

/**
 * Obtém os detalhes de uma subequipe específica
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe e da subequipe
 * @returns Detalhes da subequipe com membros
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { subteamId } = params
    
    // Obtém o cliente atual autenticado
    const company = await getCurrentCompany()

    if (!company) {
      return NextResponse.json(
        { error: "Não autenticado ou empresa não encontrada" },
        { status: 401 }
      )
    }

    // Obtém a subequipe
    try {
      const subteam = await TeamService.getSubteamWithMembers(subteamId)
      
      // Obtém a equipe principal para verificar se pertence à empresa do usuário
      const team = await TeamService.getTeamWithMembers(subteam.team_id)
      if (team.company_id !== company.id) {
        return NextResponse.json(
          { error: "Acesso negado" },
          { status: 403 }
        )
      }
      
      return NextResponse.json(subteam)
    } catch (error) {
      return NextResponse.json(
        { error: "Subequipe não encontrada" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("[SUBTEAM_GET]", error)
    return NextResponse.json(
      { error: "Erro ao buscar subequipe" },
      { status: 500 }
    )
  }
}

/**
 * Atualiza uma subequipe
 * 
 * @param request Objeto de requisição com dados da subequipe
 * @param params Parâmetros da rota, incluindo o ID da equipe e da subequipe
 * @returns Subequipe atualizada
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
        { error: "Apenas administradores podem atualizar subequipes" },
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
    const validationResult = subteamUpdateSchema.safeParse({
      ...body,
      updated_by: company.userId,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Atualiza a subequipe
    const subteam = await TeamService.updateSubteam(subteamId, validationResult.data)

    return NextResponse.json(subteam)
  } catch (error) {
    console.error("[SUBTEAM_PUT]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar subequipe" },
      { status: 500 }
    )
  }
}

/**
 * Exclui uma subequipe
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe e da subequipe
 * @returns Status de sucesso ou erro
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
        { error: "Apenas administradores podem excluir subequipes" },
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

    // Exclui a subequipe
    await TeamService.deleteSubteam(subteamId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SUBTEAM_DELETE]", error)
    return NextResponse.json(
      { error: "Erro ao excluir subequipe" },
      { status: 500 }
    )
  }
} 