/**
 * API para gerenciamento de onboarding
 * Implementa endpoints RESTful para a coleção de onboardings
 * @file app/api/onboarding/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingFiltersSchema, onboardingAssignSchema } from "@/lib/schemas/onboarding-schema"
import { OnboardingFilters, OnboardingStatus } from "@/lib/types/onboarding"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * GET - Obtém lista de onboardings com paginação e filtros
 * @param request Requisição com parâmetros de consulta
 * @returns Resposta com lista paginada de onboardings
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação e obtém dados da empresa
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
    
    // Obtém parâmetros da query string
    const searchParams = request.nextUrl.searchParams
    const isAdmin = searchParams.get("isAdmin") === "true"
    const employeeId = searchParams.get("employeeId") || undefined
    
    // Constrói os filtros com base nos parâmetros
    const filters: OnboardingFilters = {}
    
    const status = searchParams.get("status") || undefined
    if (status && (status === "pending" || status === "completed")) {
      filters.status = status as OnboardingStatus
    }
    
    const filterEmployeeId = searchParams.get("filterEmployeeId") || undefined
    if (filterEmployeeId) {
      filters.employeeId = filterEmployeeId
    }
    
    const search = searchParams.get("search") || undefined
    if (search) {
      filters.search = search
    }
    
    // Valida os filtros
    const validationResult = onboardingFiltersSchema.safeParse(filters)
    
    if (!validationResult.success) {
      return errorResponse({
        error: {
          message: "Filtros inválidos",
          details: validationResult.error.format(),
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
    
    // Se não for admin, só pode ver seus próprios onboardings
    if (!isAdmin && !employeeId) {
      return errorResponse({
        error: {
          message: "ID do funcionário é obrigatório para usuários não administradores",
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.BAD_REQUEST
      })
    }
    
    // Se for admin e não fornecer employeeId, usa o ID da empresa atual
    const companyId = company.id
    
    // Obtém a lista de onboardings
    const onboardings = await onboardingService.getOnboardings(
      companyId,
      isAdmin,
      employeeId,
      validationResult.data as OnboardingFilters
    )
    
    // Aplica paginação
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const startIndex = (page - 1) * pageSize
    const endIndex = page * pageSize
    const paginatedOnboardings = onboardings.slice(startIndex, endIndex)
    const totalItems = onboardings.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return successResponse({
      data: paginatedOnboardings,
      message: `${paginatedOnboardings.length} onboardings encontrados`,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    })
  } catch (error) {
    console.error("[ONBOARDING_GET]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar onboardings",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Cria novo(s) onboarding(s) atribuindo tarefa(s) a um funcionário
 * @param request Requisição com dados para atribuição
 * @returns Resposta com os onboardings criados
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação e obtém dados da empresa
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
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingAssignSchema.safeParse(body)
    
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
    
    const { employee_id, task_ids, notes, due_date } = validationResult.data
    
    // Verifica se o funcionário pertence à empresa do usuário
    try {
      // Atribui as tarefas
      const onboardings = await onboardingService.assignTasks(
        employee_id,
        task_ids,
        notes,
        due_date
      )
      
      return successResponse({
        data: onboardings,
        message: `${onboardings.length} tarefas atribuídas com sucesso`,
        status: HttpStatus.CREATED
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atribuir tarefas",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[ONBOARDING_POST]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atribuir tarefas de onboarding",
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
export function PUT() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PUT em /api/onboarding/[id] para atualizar um onboarding específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PATCH - Método não permitido na rota de coleção
 */
export function PATCH() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PATCH em /api/onboarding/[id] para atualizar parcialmente um onboarding específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * DELETE - Método não permitido na rota de coleção
 */
export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use DELETE em /api/onboarding/[id] para remover um onboarding específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 