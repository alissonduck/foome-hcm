/**
 * API para gerenciamento de funcionário específico
 * @file app/api/employees/[id]/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeService } from "@/lib/services/employee-service"
import { employeeUpdateSchema } from "@/lib/schemas/employee-schema"

type RouteParams = {
  params: {
    id: string
  }
}

/**
 * GET - Obter funcionário específico
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta com o funcionário
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    const employeeId = params.id
    
    // Obtém funcionário
    const employee = await employeeService.getEmployee(employeeId)
    
    // Verifica se o funcionário existe
    if (!employee) {
      return NextResponse.json(
        { error: { message: "Funcionário não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    if (employee.company_id !== company.id && !company.isAdmin) {
      return NextResponse.json(
        { error: { message: "Acesso negado" } },
        { status: 403 }
      )
    }
    
    return NextResponse.json(employee)
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar funcionário", details: error } },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar funcionário existente
 * @param request Requisição com dados do funcionário
 * @param params Parâmetros da rota
 * @returns Resposta com o funcionário atualizado
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Verifica se o usuário é administrador
    const isAdminUser = await isAdmin()
    
    if (!isAdminUser) {
      return NextResponse.json(
        { error: { message: "Apenas administradores podem atualizar funcionários" } },
        { status: 403 }
      )
    }
    
    // Obtém empresa do usuário
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Empresa não encontrada" } },
        { status: 404 }
      )
    }
    
    const employeeId = params.id
    
    // Verifica se o funcionário existe
    const supabase = await createClient()
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .single()
    
    if (!existingEmployee) {
      return NextResponse.json(
        { error: { message: "Funcionário não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    if (existingEmployee.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Acesso negado" } },
        { status: 403 }
      )
    }
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema
    const validationResult = employeeUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Dados inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Atualiza funcionário
    const updatedEmployee = await employeeService.updateEmployee(employeeId, validationResult.data)
    
    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao atualizar funcionário", details: error } },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remover funcionário
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta de sucesso
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Verifica se o usuário é administrador
    const isAdminUser = await isAdmin()
    
    if (!isAdminUser) {
      return NextResponse.json(
        { error: { message: "Apenas administradores podem remover funcionários" } },
        { status: 403 }
      )
    }
    
    // Obtém empresa do usuário
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Empresa não encontrada" } },
        { status: 404 }
      )
    }
    
    const employeeId = params.id
    
    // Verifica se o funcionário existe
    const supabase = await createClient()
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .single()
    
    if (!existingEmployee) {
      return NextResponse.json(
        { error: { message: "Funcionário não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    if (existingEmployee.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Acesso negado" } },
        { status: 403 }
      )
    }
    
    // Remove funcionário
    await employeeService.deleteEmployee(employeeId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao remover funcionário:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao remover funcionário", details: error } },
      { status: 500 }
    )
  }
} 