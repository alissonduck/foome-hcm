/**
 * API para gerenciamento de uma tarefa de onboarding específica
 * Implementa endpoints RESTful para operações em uma tarefa
 * @file app/api/onboarding/tasks/[id]/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingTaskUpdateSchema } from "@/lib/schemas/onboarding-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { z } from "zod"

// Schema para atualização parcial da tarefa
const taskPatchSchema = onboardingTaskUpdateSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "Pelo menos um campo deve ser fornecido para atualização" }
)

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET - Obtém uma tarefa de onboarding específica pelo ID
 * @param request Requisição
 * @param context Contexto com parâmetros da rota
 * @returns Detalhes da tarefa
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
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
    
    // Obtém a tarefa
    const task = await onboardingService.getTask(taskId)
    
    if (!task) {
      return errorResponse({
        error: {
          message: "Tarefa não encontrada",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (task.company_id !== company.id) {
      return errorResponse({
        error: {
          message: "Acesso negado a esta tarefa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    return successResponse({
      data: task,
      message: "Tarefa encontrada com sucesso"
    })
  } catch (error) {
    console.error("[TASK_GET_BY_ID]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar tarefa de onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Atualiza completamente uma tarefa de onboarding
 * @param request Requisição com dados da tarefa
 * @param context Contexto com parâmetros da rota
 * @returns Tarefa atualizada
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
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
          message: "Apenas administradores podem atualizar tarefas",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém a tarefa existente para verificar a propriedade
    const existingTask = await onboardingService.getTask(taskId)
    
    if (!existingTask) {
      return errorResponse({
        error: {
          message: "Tarefa não encontrada",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (existingTask.company_id !== company.id) {
      return errorResponse({
        error: {
          message: "Acesso negado a esta tarefa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingTaskUpdateSchema.safeParse(body)
    
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
    
    // Atualiza a tarefa
    try {
      const task = await onboardingService.updateTask(taskId, {
        ...validationResult.data,
        company_id: company.id  // Garante que a empresa não seja alterada
      })
      
      return successResponse({
        data: task,
        message: "Tarefa atualizada com sucesso"
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atualizar tarefa",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[TASK_PUT]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar tarefa de onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PATCH - Atualiza parcialmente uma tarefa de onboarding
 * @param request Requisição com dados parciais da tarefa
 * @param context Contexto com parâmetros da rota
 * @returns Tarefa atualizada
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
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
          message: "Apenas administradores podem atualizar tarefas",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém a tarefa existente para verificar a propriedade
    const existingTask = await onboardingService.getTask(taskId)
    
    if (!existingTask) {
      return errorResponse({
        error: {
          message: "Tarefa não encontrada",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (existingTask.company_id !== company.id) {
      return errorResponse({
        error: {
          message: "Acesso negado a esta tarefa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = taskPatchSchema.safeParse(body)
    
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
    
    // Atualiza a tarefa
    try {
      const task = await onboardingService.updateTask(taskId, {
        ...validationResult.data,
        company_id: company.id  // Garante que a empresa não seja alterada
      })
      
      return successResponse({
        data: task,
        message: "Tarefa atualizada parcialmente com sucesso"
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atualizar tarefa",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[TASK_PATCH]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar parcialmente tarefa de onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * DELETE - Exclui uma tarefa de onboarding pelo ID
 * @param request Requisição
 * @param context Contexto com parâmetros da rota
 * @returns Confirmação de exclusão
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
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
          message: "Apenas administradores podem excluir tarefas",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém a tarefa existente para verificar a propriedade
    const existingTask = await onboardingService.getTask(taskId)
    
    if (!existingTask) {
      return errorResponse({
        error: {
          message: "Tarefa não encontrada",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (existingTask.company_id !== company.id) {
      return errorResponse({
        error: {
          message: "Acesso negado a esta tarefa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Exclui a tarefa
    await onboardingService.deleteTask(taskId)
    
    return successResponse({
      message: "Tarefa excluída com sucesso",
      status: HttpStatus.NO_CONTENT
    })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao excluir tarefa de onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
} 