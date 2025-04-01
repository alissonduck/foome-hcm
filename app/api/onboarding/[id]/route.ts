/**
 * API para gerenciamento de um onboarding específico
 * Implementa endpoints RESTful para operações em um onboarding
 * @file app/api/onboarding/[id]/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { onboardingStatusUpdateSchema } from "@/lib/schemas/onboarding-schema"
import { z } from "zod"

// Schema para atualização completa do onboarding
const onboardingUpdateSchema = z.object({
  status: z.enum(["pending", "completed"]),
  notes: z.string().optional(),
  due_date: z.string().optional(),
})

// Schema para atualização parcial do onboarding
const onboardingPatchSchema = onboardingUpdateSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "Pelo menos um campo deve ser fornecido para atualização" }
)

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET - Obtém um onboarding específico pelo ID
 * @param request Requisição
 * @param context Contexto com parâmetros da rota
 * @returns Detalhes do onboarding
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
    
    // Obtém o onboarding
    const onboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!onboarding) {
      return errorResponse({
        error: {
          message: "Onboarding não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Verifica se o onboarding pertence a um funcionário da empresa do usuário ou ao próprio usuário
    // Se não for admin, só pode ver seus próprios onboardings
    if (!company.isAdmin && onboarding.employee_id !== company.userId) {
      return errorResponse({
        error: {
          message: "Acesso negado a este onboarding",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    return successResponse({
      data: onboarding,
      message: "Onboarding encontrado com sucesso"
    })
  } catch (error) {
    console.error("[ONBOARDING_GET_BY_ID]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Atualiza completamente um onboarding
 * @param request Requisição com dados do onboarding
 * @param context Contexto com parâmetros da rota
 * @returns Onboarding atualizado
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
    const validationResult = onboardingUpdateSchema.safeParse(body)
    
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
    
    // Atualiza o onboarding
    try {
      // Primeiro, atualiza os campos básicos
      const updatedData: any = {
        notes: validationResult.data.notes,
        due_date: validationResult.data.due_date,
      }
      
      await onboardingService.updateOnboarding(onboardingId, updatedData)
      
      // Se houver alteração de status, atualiza o status separadamente
      if (validationResult.data.status) {
        await onboardingService.updateStatus(
          onboardingId,
          validationResult.data.status,
          company.isAdmin ? company.userId : undefined
        )
      }
      
      // Busca o onboarding atualizado
      const updatedOnboarding = await onboardingService.getOnboarding(onboardingId)
      
      return successResponse({
        data: updatedOnboarding,
        message: "Onboarding atualizado com sucesso"
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atualizar onboarding",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[ONBOARDING_PUT]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PATCH - Atualiza parcialmente um onboarding
 * @param request Requisição com dados parciais do onboarding
 * @param context Contexto com parâmetros da rota
 * @returns Onboarding atualizado
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
    const validationResult = onboardingPatchSchema.safeParse(body)
    
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
    
    // Atualiza o onboarding
    try {
      const data = validationResult.data
      
      // Se houver campos básicos para atualizar
      if (data.notes !== undefined || data.due_date !== undefined) {
        const updateData: any = {}
        
        if (data.notes !== undefined) updateData.notes = data.notes
        if (data.due_date !== undefined) updateData.due_date = data.due_date
        
        await onboardingService.updateOnboarding(onboardingId, updateData)
      }
      
      // Se houver alteração de status
      if (data.status !== undefined) {
        await onboardingService.updateStatus(
          onboardingId,
          data.status,
          company.isAdmin ? company.userId : undefined
        )
      }
      
      // Busca o onboarding atualizado
      const updatedOnboarding = await onboardingService.getOnboarding(onboardingId)
      
      return successResponse({
        data: updatedOnboarding,
        message: "Onboarding atualizado parcialmente com sucesso"
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atualizar onboarding",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[ONBOARDING_PATCH]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar parcialmente onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * DELETE - Exclui um onboarding pelo ID
 * @param request Requisição
 * @param context Contexto com parâmetros da rota
 * @returns Confirmação de exclusão
 */
export async function DELETE(
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
    
    if (!company.isAdmin) {
      return errorResponse({
        error: {
          message: "Apenas administradores podem excluir onboardings",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Obtém o onboarding para verificar se existe
    const onboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!onboarding) {
      return errorResponse({
        error: {
          message: "Onboarding não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Exclui o onboarding
    await onboardingService.deleteOnboarding(onboardingId)
    
    return successResponse({
      message: "Onboarding excluído com sucesso",
      status: HttpStatus.NO_CONTENT
    })
  } catch (error) {
    console.error("[ONBOARDING_DELETE]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao excluir onboarding",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
} 