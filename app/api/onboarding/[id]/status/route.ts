/**
 * API para atualização de status de um onboarding
 * Implementa endpoints RESTful para operações de status
 * @file app/api/onboarding/[id]/status/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { createClient } from "@/lib/supabase/server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingStatusUpdateSchema } from "@/lib/schemas/onboarding-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET - Obtém o status atual de um onboarding
 * @param request Requisição
 * @param context Contexto com parâmetros da rota
 * @returns Status do onboarding
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID do onboarding dos parâmetros
    const onboardingId = context.params.id
    
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
    
    // Obtém o onboarding existente
    const existingOnboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!existingOnboarding) {
      return errorResponse({
        error: {
          message: "Onboarding não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se o usuário tem permissão para ver o onboarding
    if (!company.isAdmin && existingOnboarding.employee_id !== company.userId) {
      return errorResponse({
        error: {
          message: "Acesso negado a este onboarding",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Retorna apenas as informações de status
    return successResponse({
      data: {
        id: existingOnboarding.id,
        status: existingOnboarding.status,
        completed_at: existingOnboarding.completed_at,
        completed_by: existingOnboarding.completed_by
      },
      message: "Status do onboarding obtido com sucesso"
    })
  } catch (error) {
    console.error("[ONBOARDING_STATUS_GET]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao obter status do onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Atualiza completamente o status de um onboarding
 * @param request Requisição com dados do status
 * @param context Contexto com parâmetros da rota
 * @returns Status atualizado
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID do onboarding dos parâmetros
    const onboardingId = context.params.id
    
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
    
    // Obtém o onboarding existente
    const existingOnboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!existingOnboarding) {
      return errorResponse({
        error: {
          message: "Onboarding não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se o usuário tem permissão para atualizar o onboarding
    if (!company.isAdmin && existingOnboarding.employee_id !== company.userId) {
      return errorResponse({
        error: {
          message: "Acesso negado a este onboarding",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingStatusUpdateSchema.safeParse(body)
    
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
    
    // Atualiza o status do onboarding
    const { status, completed_by, notes } = validationResult.data
    
    // Se for atualizar para "completed", adiciona o ID do usuário como completado_por,
    // se não for fornecido
    let completedById = completed_by || undefined
    if (status === "completed" && !completedById) {
      // Busca o ID do employee pelo userId
      const supabase = await createClient()
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", company.userId)
        .single()
      
      if (employee) {
        completedById = employee.id
      }
    }
    
    const updatedOnboarding = await onboardingService.updateStatus(
      onboardingId,
      status,
      completedById,
      notes || undefined
    )
    
    return successResponse({
      data: updatedOnboarding,
      message: "Status do onboarding atualizado com sucesso"
    })
  } catch (error) {
    console.error("[ONBOARDING_STATUS_PUT]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar status do onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PATCH - Atualiza parcialmente o status de um onboarding
 * @param request Requisição com dados parciais do status
 * @param context Contexto com parâmetros da rota
 * @returns Status atualizado
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Extrai o ID do onboarding dos parâmetros
    const onboardingId = context.params.id
    
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
    
    // Obtém o onboarding existente
    const existingOnboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!existingOnboarding) {
      return errorResponse({
        error: {
          message: "Onboarding não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se o usuário tem permissão para atualizar o onboarding
    if (!company.isAdmin && existingOnboarding.employee_id !== company.userId) {
      return errorResponse({
        error: {
          message: "Acesso negado a este onboarding",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingStatusUpdateSchema.partial().safeParse(body)
    
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
    
    // Se não houver campos válidos para atualizar
    if (Object.keys(validationResult.data).length === 0) {
      return errorResponse({
        error: {
          message: "Pelo menos um campo deve ser fornecido para atualização",
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
    
    // Atualiza o status do onboarding se fornecido
    let updatedOnboarding = existingOnboarding
    if (validationResult.data.status !== undefined) {
      const { status } = validationResult.data
      
      // Determina o completedById apropriado
      let completedById = validationResult.data.completed_by || undefined
      if (status === "completed" && !completedById) {
        // Busca o ID do employee pelo userId
        const supabase = await createClient()
        const { data: employee } = await supabase
          .from("employees")
          .select("id")
          .eq("user_id", company.userId)
          .single()
        
        if (employee) {
          completedById = employee.id
        }
      }
      
      updatedOnboarding = await onboardingService.updateStatus(
        onboardingId,
        status,
        completedById,
        validationResult.data.notes === null ? undefined : validationResult.data.notes
      )
    } else if (validationResult.data.notes !== undefined) {
      // Se apenas as notas foram fornecidas, atualiza apenas as notas
      updatedOnboarding = await onboardingService.updateOnboarding(onboardingId, {
        notes: validationResult.data.notes
      })
    }
    
    return successResponse({
      data: updatedOnboarding,
      message: "Status do onboarding atualizado parcialmente com sucesso"
    })
  } catch (error) {
    console.error("[ONBOARDING_STATUS_PATCH]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar parcialmente status do onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * DELETE - Método não permitido para status
 */
export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não permitido. Não é possível excluir status de um onboarding.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 