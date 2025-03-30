/**
 * API para gerenciamento de um membro específico de uma subequipe
 * Implementa rota para remover um membro de uma subequipe
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
    subteamId: string
    employeeId: string
  }
}

/**
 * Remove um membro de uma subequipe
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe, subequipe e funcionário
 * @returns Status de sucesso ou erro
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, subteamId, employeeId } = params
    
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
        { error: "Apenas administradores podem remover membros de subequipes" },
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

    // Verifica se o funcionário é membro da subequipe
    try {
      const subteam = await TeamService.getSubteamWithMembers(subteamId)
      const isSubteamMember = subteam.members.some(member => member.id === employeeId)

      if (!isSubteamMember) {
        return NextResponse.json(
          { error: "Funcionário não é membro da subequipe" },
          { status: 404 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Subequipe não encontrada" },
        { status: 404 }
      )
    }

    // Remove o membro da subequipe
    await TeamService.removeSubteamMember(subteamId, employeeId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SUBTEAM_MEMBER_DELETE]", error)
    return NextResponse.json(
      { error: "Erro ao remover membro da subequipe" },
      { status: 500 }
    )
  }
} 