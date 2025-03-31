/**
 * API para gerenciamento de uma solicitação específica de férias e ausências
 * Implementa rotas para obter e excluir uma solicitação específica
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TimeOffService } from "@/lib/services/time-off-service"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Obtém os detalhes de uma solicitação específica
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da solicitação
 * @returns Detalhes da solicitação
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

    // Verifica se o usuário é um funcionário e obtém suas informações
    const supabase = await createClient()
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      )
    }

    // Obtém a solicitação
    const timeOff = await TimeOffService.getTimeOff(id)

    // Verifica se a solicitação existe
    if (!timeOff) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    // Verifica se o usuário tem permissão para ver a solicitação
    const isUserAdmin = await isAdmin(supabase, company.userId)
    const canAccess = isUserAdmin.isAdmin || timeOff.employee_id === employee.id

    if (!canAccess) {
      return NextResponse.json(
        { error: "Sem permissão para acessar esta solicitação" },
        { status: 403 }
      )
    }

    return NextResponse.json(timeOff)
  } catch (error) {
    console.error("[TIME_OFF_GET_BY_ID]", error)
    return NextResponse.json(
      { error: "Erro ao buscar solicitação" },
      { status: 500 }
    )
  }
}

/**
 * Exclui uma solicitação de férias e ausências
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota, incluindo o ID da solicitação
 * @returns Status de sucesso ou erro
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

    // Verifica se o usuário é um funcionário e obtém suas informações
    const supabase = await createClient()
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      )
    }

    // Obtém a solicitação para verificar permissões
    const timeOff = await TimeOffService.getTimeOff(id)

    // Verifica se a solicitação existe
    if (!timeOff) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    // Verifica se o usuário tem permissão para excluir a solicitação
    const isUserAdmin = await isAdmin(supabase, company.userId)
    const canDelete = isUserAdmin.isAdmin || 
                      (timeOff.employee_id === employee.id && timeOff.status === "pending")

    if (!canDelete) {
      return NextResponse.json(
        { error: "Sem permissão para excluir esta solicitação" },
        { status: 403 }
      )
    }

    // Exclui a solicitação
    await TimeOffService.deleteTimeOff(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TIME_OFF_DELETE]", error)
    return NextResponse.json(
      { error: "Erro ao excluir solicitação" },
      { status: 500 }
    )
  }
} 