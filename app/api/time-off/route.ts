/**
 * API para gerenciamento de férias e ausências
 * Implementa rotas para listar e criar solicitações de férias e ausências
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TimeOffService } from "@/lib/services/time-off-service"
import { timeOffCreateSchema } from "@/lib/schemas/time-off-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

/**
 * Obtém todas as solicitações de férias e ausências do usuário ou da empresa
 * 
 * @param request Objeto de requisição
 * @returns Lista de solicitações de férias e ausências
 */
export async function GET(request: NextRequest) {
  try {
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
      .select("id, company_id, is_admin")
      .eq("user_id", company.userId)
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      )
    }

    // Verifica se é admin e pega o parâmetro employeeId se houver
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const isUserAdmin = await isAdmin(supabase, company.userId)

    // Se não for admin, só pode ver suas próprias solicitações
    if (!isUserAdmin.isAdmin && employeeId && employeeId !== employee.id) {
      return NextResponse.json(
        { error: "Sem permissão para ver solicitações de outros funcionários" },
        { status: 403 }
      )
    }

    // Define o ID do funcionário para filtrar (null para admins verem todos)
    const filterEmployeeId = employeeId || (isUserAdmin.isAdmin ? null : employee.id)

    // Obtém as solicitações
    const timeOffs = await TimeOffService.getTimeOffs(filterEmployeeId, employee.company_id)

    return NextResponse.json(timeOffs)
  } catch (error) {
    console.error("[TIME_OFF_GET]", error)
    return NextResponse.json(
      { error: "Erro ao buscar solicitações de férias e ausências" },
      { status: 500 }
    )
  }
}

/**
 * Cria uma nova solicitação de férias ou ausência
 * 
 * @param request Objeto de requisição com dados da solicitação
 * @returns Solicitação criada
 */
export async function POST(request: NextRequest) {
  try {
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
      .select("id, company_id, is_admin")
      .eq("user_id", company.userId)
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      )
    }

    // Obtém os dados da requisição
    const body = await request.json()

    // Se não for admin, só pode criar solicitações para si mesmo
    const isUserAdmin = await isAdmin(supabase, company.userId)
    if (!isUserAdmin.isAdmin && body.employee_id !== employee.id) {
      return NextResponse.json(
        { error: "Sem permissão para criar solicitações para outros funcionários" },
        { status: 403 }
      )
    }

    // Valida os dados
    const validationResult = timeOffCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Cria a solicitação
    const timeOff = await TimeOffService.createTimeOff({
      ...validationResult.data,
      status: "pending"
    })

    return NextResponse.json(timeOff)
  } catch (error) {
    console.error("[TIME_OFF_POST]", error)
    return NextResponse.json(
      { error: "Erro ao criar solicitação de férias ou ausência" },
      { status: 500 }
    )
  }
} 