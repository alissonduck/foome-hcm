/**
 * API para gerenciamento de um membro específico de uma equipe
 * Implementa rotas para remover um membro de uma equipe
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
    employeeId: string
  }
}

/**
 * Remove um membro de uma equipe
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da equipe e do funcionário
 * @returns Confirmação da remoção
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, employeeId } = params
    
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
        { error: "Apenas administradores podem remover membros" },
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
      
      // Verifica se o funcionário é membro da equipe
      const isMember = existingTeam.members.some(member => member.id === employeeId)
      
      if (!isMember) {
        return NextResponse.json(
          { error: "Funcionário não é membro desta equipe" },
          { status: 404 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }

    // Remove o membro da equipe
    await TeamService.removeTeamMember(id, employeeId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEAM_MEMBER_DELETE]", error)
    return NextResponse.json(
      { error: "Erro ao remover membro da equipe" },
      { status: 500 }
    )
  }
} 