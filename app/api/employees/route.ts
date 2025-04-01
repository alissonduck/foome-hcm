/**
 * API para gerenciamento de funcionários
 * Implementa endpoints RESTful para a coleção de funcionários
 * @file app/api/employees/route.ts
 */

import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeService } from "@/lib/services/employee-service"
import { employeeCreateSchema } from "@/lib/schemas/employee-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * GET - Obter lista de funcionários com paginação e filtros
 * @param request Requisição com parâmetros de consulta
 * @returns Resposta com lista paginada de funcionários
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return errorResponse({
        error: {
          message: "Não autorizado",
          code: ErrorCodes.AUTHENTICATION_ERROR
        },
        status: HttpStatus.UNAUTHORIZED
      })
    }
    
    // Obtém parâmetros de paginação, filtro e ordenação
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const status = searchParams.get("status")
    const department = searchParams.get("department")
    const search = searchParams.get("search")
    const orderBy = searchParams.get("orderBy") || "full_name"
    const orderDirection = searchParams.get("orderDirection") || "asc"
    
    // Obtém funcionários com filtros
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
    
    // Aplica ordenação (simulação - isso deve ser implementado no service)
    if (orderBy && orderDirection) {
      // Esta seria a implementação no service
      // Por enquanto apenas simularemos a paginação
    }
    
    // Aplica paginação (simulação - isso deve ser implementado no service)
    const startIndex = (page - 1) * pageSize
    const endIndex = page * pageSize
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)
    const totalItems = filteredEmployees.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return successResponse({
      data: paginatedEmployees,
      message: `${totalItems} funcionários encontrados`,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    })
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar funcionários",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Criar novo funcionário
 * @param request Requisição com dados do funcionário
 * @returns Resposta com o funcionário criado
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica se o usuário é administrador
    const isAdminUser = await isAdmin()
    
    if (!isAdminUser) {
      return errorResponse({
        error: {
          message: "Apenas administradores podem criar funcionários",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém empresa do usuário
    const company = await getCurrentCompany()
    
    if (!company) {
      return errorResponse({
        error: {
          message: "Empresa não encontrada",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema
    const validationResult = employeeCreateSchema.safeParse({
      ...body,
      company_id: company.id
    })
    
    if (!validationResult.success) {
      return errorResponse({
        error: {
          message: "Dados inválidos",
          details: validationResult.error.format(),
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
    
    // Cria funcionário
    const employee = await employeeService.createEmployee(validationResult.data)
    
    return successResponse({
      data: employee,
      message: "Funcionário criado com sucesso",
      status: HttpStatus.CREATED
    })
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao criar funcionário",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Método não permitido na rota de coleção
 */
export async function PUT() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PUT em /api/employees/[id] para atualizar um funcionário específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PATCH - Método não permitido na rota de coleção
 */
export async function PATCH() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PATCH em /api/employees/[id] para atualizar parcialmente um funcionário específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * DELETE - Método não permitido na rota de coleção
 */
export async function DELETE() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use DELETE em /api/employees/[id] para remover um funcionário específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 