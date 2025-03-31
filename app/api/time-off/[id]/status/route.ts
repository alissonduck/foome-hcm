/**
 * API para gerenciamento do status de uma solicitação de férias e ausências
 * Implementa rota para atualizar o status de uma solicitação
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TimeOffService } from "@/lib/services/time-off-service"
import { timeOffStatusUpdateSchema } from "@/lib/schemas/time-off-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Atualiza o status de uma solicitação de férias e ausências
 * 
 * @param request Objeto de requisição com o novo status
 * @param params Parâmetros da rota, incluindo o ID da solicitação
 * @returns Solicitação atualizada
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Verifica se o usuário é administrador (apenas admins podem aprovar/rejeitar)
    const currentUser = await isAdmin(supabase, company.userId)
    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem aprovar ou rejeitar solicitações" },
        { status: 403 }
      )
    }

    // Obtém a solicitação para verificar se existe
    const timeOff = await TimeOffService.getTimeOff(id)

    // Verifica se a solicitação existe
    if (!timeOff) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      )
    }

    // Verifica se a solicitação já foi processada
    if (timeOff.status !== "pending") {
      return NextResponse.json(
        { error: "Solicitação já foi processada anteriormente" },
        { status: 400 }
      )
    }

    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = timeOffStatusUpdateSchema.safeParse({
      ...body,
      approved_by: employee.id
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Atualiza o status da solicitação
    const updatedTimeOff = await TimeOffService.updateTimeOffStatus(
      id, 
      validationResult.data.status, 
      validationResult.data.approved_by
    )

    // Se a solicitação for de férias e for aprovada, atualiza o status do funcionário
    if (timeOff.type === "vacation" && validationResult.data.status === "approved") {
      const today = new Date()
      const startDate = new Date(timeOff.start_date)
      const endDate = new Date(timeOff.end_date)
      
      // Verifica se as férias são para o período atual
      const isCurrentOrFuture = startDate <= today && today <= endDate
      
      if (isCurrentOrFuture) {
        await TimeOffService.updateEmployeeVacationStatus(timeOff.employee_id, true)
      }
    }

    return NextResponse.json(updatedTimeOff)
  } catch (error) {
    console.error("[TIME_OFF_STATUS_PATCH]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar status da solicitação" },
      { status: 500 }
    )
  }
} 