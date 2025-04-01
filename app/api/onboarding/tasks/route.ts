/**
 * API para gerenciamento de tarefas de onboarding
 * Implementa endpoints RESTful para a coleção de tarefas de onboarding
 * @file app/api/onboarding/tasks/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingTaskCreateSchema } from "@/lib/schemas/onboarding-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * GET - Obtém lista de tarefas de onboarding com filtros
 * @param request Requisição com parâmetros de consulta
 * @returns Resposta com lista de tarefas de onboarding
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
    
    // Obtém o ID da empresa da query string
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get("companyId") || company.id
    
    // Verifica se o usuário tem acesso à empresa solicitada
    if (companyId !== company.id && !company.isAdmin) {
      return errorResponse({
        error: {
          message: "Acesso negado a esta empresa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Aplica filtros opcionais
    const category = searchParams.get("category") || undefined
    
    // Obtém tarefas
    const tasks = await onboardingService.getTasks(companyId)
    
    // Filtra por categoria, se especificado
    let filteredTasks = tasks
    if (category) {
      filteredTasks = tasks.filter(task => task.category === category)
    }
    
    // Aplica paginação
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const startIndex = (page - 1) * pageSize
    const endIndex = page * pageSize
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
    const totalItems = filteredTasks.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return successResponse({
      data: paginatedTasks,
      message: `${totalItems} tarefas encontradas`,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    })
  } catch (error) {
    console.error("[ONBOARDING_TASKS_GET]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar tarefas de onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Cria uma nova tarefa de onboarding
 * @param request Requisição com dados da tarefa
 * @returns Resposta com a tarefa criada
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
    
    if (!company.isAdmin) {
      return errorResponse({
        error: {
          message: "Apenas administradores podem criar tarefas",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingTaskCreateSchema.safeParse(body)
    
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
    
    // Cria a tarefa
    try {
      const task = await onboardingService.createTask({
        ...validationResult.data,
        company_id: company.id  // Garante que a tarefa seja criada para a empresa do usuário
      })
      
      return successResponse({
        data: task,
        message: "Tarefa de onboarding criada com sucesso",
        status: HttpStatus.CREATED
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao criar tarefa",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[ONBOARDING_TASKS_POST]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao criar tarefa de onboarding",
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
      message: "Método não permitido. Use PUT em /api/onboarding/tasks/[id] para atualizar uma tarefa específica",
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
      message: "Método não permitido. Use PATCH em /api/onboarding/tasks/[id] para atualizar parcialmente uma tarefa específica",
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
      message: "Método não permitido. Use DELETE em /api/onboarding/tasks/[id] para remover uma tarefa específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 