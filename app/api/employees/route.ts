/**
 * API para gerenciamento de funcionários
 * @file app/api/employees/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeService } from "@/lib/services/employee-service"
import { employeeCreateSchema } from "@/lib/schemas/employee-schema"

/**
 * GET - Obter lista de funcionários
 * @param request Requisição
 * @returns Resposta com a lista de funcionários
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    // Obtém parâmetros de consulta (filtros)
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const department = searchParams.get("department")
    const search = searchParams.get("search")
    
    // Obtém funcionários
    const employees = await employeeService.getEmployees(company.id)
    
    // Aplica filtros, se houver
    let filteredEmployees = employees
    if (status || department || search) {
      filteredEmployees = employeeService.filterEmployees(employees, {
        status: status as any,
        department: department as any,
        search: search || undefined
      })
    }
    
    return NextResponse.json(filteredEmployees)
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar funcionários", details: error } },
      { status: 500 }
    )
  }
}

/**
 * POST - Criar novo funcionário
 * @param request Requisição com dados do funcionário
 * @returns Resposta com o funcionário criado
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifica se o usuário é administrador
    const isAdminUser = await isAdmin()
    
    if (!isAdminUser) {
      return NextResponse.json(
        { error: { message: "Apenas administradores podem criar funcionários" } },
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
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema
    const validationResult = employeeCreateSchema.safeParse({
      ...body,
      company_id: company.id
    })
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Dados inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Cria funcionário
    const employee = await employeeService.createEmployee(validationResult.data)
    
    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao criar funcionário", details: error } },
      { status: 500 }
    )
  }
} 