/**
 * API para atribuição de tarefas de onboarding
 * Implementa endpoints RESTful para atribuição de tarefas de onboarding
 * @file app/api/onboarding/assign/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { createClient } from "@/lib/supabase/server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingAssignSchema } from "@/lib/schemas/onboarding-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * GET - Obtém atribuições existentes (por funcionário ou tarefa)
 * @param request Requisição com parâmetros de consulta
 * @returns Lista de atribuições
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
    let employeeId = searchParams.get("employeeId") || undefined
    const taskId = searchParams.get("taskId") || undefined
    
    if (!employeeId && !taskId) {
      return errorResponse({
        error: {
          message: "É necessário fornecer employeeId ou taskId para consulta",
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.BAD_REQUEST
      })
    }
    
    // Se não for admin, só pode ver as atribuições ligadas ao próprio usuário
    if (!company.isAdmin) {
      // Verifica se é uma consulta para o próprio usuário
      const supabase = await createClient()
      const { data: currentEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", company.userId)
        .single()
      
      if (!currentEmployee || (employeeId && currentEmployee.id !== employeeId)) {
        return errorResponse({
          error: {
            message: "Você só pode consultar suas próprias atribuições",
            code: ErrorCodes.AUTHORIZATION_ERROR
          },
          status: HttpStatus.FORBIDDEN
        })
      }
      
      // Usa o ID do funcionário atual se nenhum for fornecido
      if (!employeeId) {
        employeeId = currentEmployee.id
      }
    }
    
    // Consulta onboardings por funcionário ou tarefa
    let filters = {}
    if (employeeId) {
      filters = { employeeId }
    }
    
    const onboardings = await onboardingService.getOnboardings(
      company.id,
      company.isAdmin,
      employeeId,
      filters
    )
    
    // Filtra por tarefa, se especificado
    let result = onboardings
    if (taskId) {
      result = onboardings.filter(item => item.task_id === taskId)
    }
    
    // Aplica paginação
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const startIndex = (page - 1) * pageSize
    const endIndex = page * pageSize
    const paginatedItems = result.slice(startIndex, endIndex)
    const totalItems = result.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return successResponse({
      data: paginatedItems,
      message: `${totalItems} atribuições encontradas`,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    })
  } catch (error) {
    console.error("[ONBOARDING_ASSIGN_GET]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar atribuições de onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Atribui tarefas de onboarding a um funcionário
 * @param request Requisição com dados de atribuição
 * @returns Resposta com as tarefas atribuídas
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
    
    // Verifica se o usuário tem permissão para atribuir tarefas ao funcionário
    // Se não for admin, só pode atribuir tarefas a si mesmo
    if (!company.isAdmin) {
      const supabase = await createClient()
      // Busca o ID do employee do usuário atual
      const { data: currentEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", company.userId)
        .single()
      
      if (!currentEmployee || currentEmployee.id !== employee_id) {
        return errorResponse({
          error: {
            message: "Você só pode atribuir tarefas a si mesmo",
            code: ErrorCodes.AUTHORIZATION_ERROR
          },
          status: HttpStatus.FORBIDDEN
        })
      }
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    const supabase = await createClient()
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employee_id)
      .single()
    
    if (employeeError || !employee) {
      return errorResponse({
        error: {
          message: "Funcionário não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    if (employee.company_id !== company.id) {
      return errorResponse({
        error: {
          message: "Funcionário não pertence à sua empresa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Verifica se todas as tarefas pertencem à empresa do usuário
    const { data: tasks, error: tasksError } = await supabase
      .from("onboarding_tasks")
      .select("id, company_id")
      .in("id", task_ids)
    
    if (tasksError || !tasks || tasks.length !== task_ids.length) {
      return errorResponse({
        error: {
          message: "Uma ou mais tarefas não foram encontradas",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    const invalidTask = tasks.find(task => task.company_id !== company.id)
    if (invalidTask) {
      return errorResponse({
        error: {
          message: "Uma ou mais tarefas não pertencem à sua empresa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Atribui as tarefas
    try {
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
    console.error("[ONBOARDING_ASSIGN_POST]", error)
    
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
 * PUT - Método não permitido na rota de atribuição
 * Para modificar atribuições, use o endpoint específico
 */
export function PUT() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use POST para criar atribuições e /api/onboarding/[id] para atualizar uma atribuição específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PATCH - Método não permitido na rota de atribuição
 * Para modificar atribuições, use o endpoint específico
 */
export function PATCH() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use POST para criar atribuições e /api/onboarding/[id] para atualizar uma atribuição específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * DELETE - Método não permitido na rota de atribuição
 * Para remover atribuições, use o endpoint específico
 */
export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use /api/onboarding/[id] para remover uma atribuição específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 