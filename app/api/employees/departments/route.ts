/**
 * API para gerenciamento de departamentos
 * @file app/api/employees/departments/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeService } from "@/lib/services/employee-service"

/**
 * GET - Obter lista de departamentos
 * @param request Requisição
 * @returns Resposta com a lista de departamentos
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
    
    // Obtém departamentos
    const departments = await employeeService.getDepartments(company.id)
    
    return NextResponse.json(departments)
  } catch (error) {
    console.error("Erro ao buscar departamentos:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar departamentos", details: error } },
      { status: 500 }
    )
  }
} 