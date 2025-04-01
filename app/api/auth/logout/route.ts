/**
 * API para logout de usuários
 * Implementa rota para encerrar a sessão de um usuário
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Realiza logout de usuário
 * 
 * @param request Objeto de requisição
 * @returns Resposta com resultado do logout
 */
export async function POST(request: NextRequest) {
  try {
    // Realiza logout
    const result = await AuthService.signOut()

    // Se o logout falhou, retorna erro
    if (!result.success) {
      return errorResponse({
        error: {
          message: "Falha ao realizar logout",
          details: result.message,
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }

    // Retorna sucesso
    return successResponse({
      message: "Logout realizado com sucesso"
    })
  } catch (error) {
    console.error("[AUTH_LOGOUT_ERROR]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao fazer logout",
        details: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação.",
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * GET - Método não suportado
 */
export function GET() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para logout.",
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
      message: "Método não suportado. Use POST para logout.",
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
      message: "Método não suportado. Use POST para logout.",
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
      message: "Método não suportado. Use POST para logout.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 