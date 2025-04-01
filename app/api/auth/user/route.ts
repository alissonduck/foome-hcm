/**
 * API para obter informações do usuário atual
 * Implementa rota para retornar dados do usuário autenticado
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * GET - Obtém dados do usuário atual
 * 
 * @param request Objeto de requisição
 * @returns Resposta com dados do usuário ou erro
 */
export async function GET(request: NextRequest) {
  try {
    // Obtém usuário atual
    const user = await AuthService.getCurrentUser()

    // Se não encontrou o usuário, retorna 401
    if (!user) {
      return errorResponse({
        error: {
          message: "Usuário não autenticado",
          code: ErrorCodes.AUTHENTICATION_ERROR
        },
        status: HttpStatus.UNAUTHORIZED
      })
    }

    // Retorna dados do usuário
    return successResponse({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name,
        phone: user.user_metadata?.phone,
        avatarUrl: user.user_metadata?.avatar_url,
        role: user.user_metadata?.role,
      }
    })
  } catch (error) {
    console.error("[AUTH_USER_ERROR]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao obter dados do usuário",
        details: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação.",
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Método não suportado
 */
export function POST() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use GET para obter dados do usuário.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PUT - Método não suportado
 */
export function PUT() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use GET para obter dados do usuário.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PATCH - Método não suportado
 */
export function PATCH() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use GET para obter dados do usuário.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * DELETE - Método não suportado
 */
export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use GET para obter dados do usuário.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 