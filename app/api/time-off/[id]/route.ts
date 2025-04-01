/**
 * API para gerenciamento de férias e ausências - Operações por ID
 * Implementa endpoints RESTful para solicitação específica de férias
 * @file app/api/time-off/[id]/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { TimeOffService } from "@/lib/services/time-off-service"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { timeOffCreateSchema } from "@/lib/schemas/time-off-schema"
import { getTimeOff, deleteTimeOff } from "@/server/actions/time-off-actions"
import { z } from "zod"

// Definindo schema para atualização parcial (PATCH)
const timeOffPatchSchema = z.object({
  type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  reason: z.string().min(3, { message: "O motivo deve ter pelo menos 3 caracteres" }).optional(),
  total_days: z.number().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização parcial"
})

type RouteParams = {
  params: {
    id: string
  }
}

/**
 * GET - Obtém uma solicitação específica pelo ID
 * @param request Requisição
 * @param params Parâmetros da rota (contém o ID)
 * @returns Detalhes da solicitação
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    // Usa a server action para buscar os dados
    const response = await getTimeOff(params.id)
    
    if (!response.success) {
      return errorResponse({
        error: {
          message: response.error || "Solicitação não encontrada",
          code: response.error?.includes("não encontrada") 
            ? ErrorCodes.RESOURCE_NOT_FOUND 
            : ErrorCodes.INTERNAL_ERROR
        },
        status: response.error?.includes("não encontrada") 
          ? HttpStatus.NOT_FOUND 
          : HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
    
    return successResponse({
      data: response.data,
      message: "Solicitação encontrada com sucesso"
    })
  } catch (error) {
    console.error("[TIME_OFF_GET_BY_ID]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar solicitação",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Atualiza uma solicitação (substituição completa)
 * @param request Requisição com dados da solicitação
 * @param params Parâmetros da rota (contém o ID)
 * @returns Solicitação atualizada
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    // Obtém os dados da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = timeOffCreateSchema.safeParse(body)
    
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
    
    try {
      // Primeiro verifica se a solicitação existe e se o usuário tem permissão
      const response = await getTimeOff(params.id)
      
      if (!response.success) {
        return errorResponse({
          error: {
            message: response.error || "Solicitação não encontrada",
            code: response.error?.includes("não encontrada") 
              ? ErrorCodes.RESOURCE_NOT_FOUND 
              : ErrorCodes.INTERNAL_ERROR
          },
          status: response.error?.includes("não encontrada") 
            ? HttpStatus.NOT_FOUND 
            : HttpStatus.INTERNAL_SERVER_ERROR
        })
      }
      
      // Atualiza a solicitação com o serviço
      const timeOff = await TimeOffService.updateTimeOff(params.id, {
        employee_id: body.employee_id,
        type: body.type,
        start_date: body.start_date,
        end_date: body.end_date,
        reason: body.reason,
        total_days: body.total_days,
        updated_at: new Date().toISOString()
      })
      
      return successResponse({
        data: timeOff,
        message: "Solicitação atualizada com sucesso"
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atualizar solicitação",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[TIME_OFF_PUT]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar solicitação",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PATCH - Atualiza parcialmente uma solicitação
 * @param request Requisição com dados parciais da solicitação
 * @param params Parâmetros da rota (contém o ID)
 * @returns Solicitação atualizada
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    // Obtém os dados da requisição
    const body = await request.json()
    
    // Valida os dados com o schema para PATCH
    const validationResult = timeOffPatchSchema.safeParse(body)
    
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
    
    try {
      // Primeiro verifica se a solicitação existe e se o usuário tem permissão
      const response = await getTimeOff(params.id)
      
      if (!response.success) {
        return errorResponse({
          error: {
            message: response.error || "Solicitação não encontrada",
            code: response.error?.includes("não encontrada") 
              ? ErrorCodes.RESOURCE_NOT_FOUND 
              : ErrorCodes.INTERNAL_ERROR
          },
          status: response.error?.includes("não encontrada") 
            ? HttpStatus.NOT_FOUND 
            : HttpStatus.INTERNAL_SERVER_ERROR
        })
      }
      
      // Se estiver alterando o status e for um administrador, use updateTimeOffStatus
      if (body.status && company.isAdmin) {
        // Esta rota não deve alterar o status - para isso deve-se usar a rota específica
        return errorResponse({
          error: {
            message: "Para alterar o status, use a rota /api/time-off/[id]/status",
            code: ErrorCodes.VALIDATION_ERROR
          },
          status: HttpStatus.UNPROCESSABLE_ENTITY
        })
      }
      
      // Atualiza parcialmente a solicitação
      const updateData = {
        ...validationResult.data,
        updated_at: new Date().toISOString()
      }
      
      const timeOff = await TimeOffService.updateTimeOff(params.id, updateData)
      
      return successResponse({
        data: timeOff,
        message: "Solicitação atualizada parcialmente com sucesso"
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao atualizar solicitação",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[TIME_OFF_PATCH]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar parcialmente a solicitação",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * DELETE - Exclui uma solicitação pelo ID
 * @param request Requisição
 * @param params Parâmetros da rota (contém o ID)
 * @returns Confirmação de exclusão
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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
    
    // Usa a server action para excluir a solicitação
    const response = await deleteTimeOff(params.id)
    
    if (!response.success) {
      return errorResponse({
        error: {
          message: response.error || "Erro ao excluir solicitação",
          code: response.error?.includes("não encontrada") 
            ? ErrorCodes.RESOURCE_NOT_FOUND 
            : ErrorCodes.INTERNAL_ERROR
        },
        status: response.error?.includes("não encontrada") 
          ? HttpStatus.NOT_FOUND 
          : HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
    
    return successResponse({
      message: "Solicitação excluída com sucesso",
      status: HttpStatus.NO_CONTENT
    })
  } catch (error) {
    console.error("[TIME_OFF_DELETE]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao excluir solicitação",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
} 