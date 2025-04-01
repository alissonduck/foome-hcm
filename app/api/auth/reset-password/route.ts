/**
 * API para redefinir senha
 * Implementa rota para atualizar a senha do usuário
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { resetPasswordSchema } from "@/lib/schemas/auth-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Redefine senha do usuário
 * 
 * @param request Objeto de requisição com a nova senha
 * @returns Resposta com resultado da redefinição
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = resetPasswordSchema.safeParse(body)

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

    // Redefine a senha
    const result = await AuthService.resetPassword({
      password: validationResult.data.password,
      confirmPassword: validationResult.data.confirmPassword
    })

    // Se a redefinição falhou, retorna erro
    if (!result.success) {
      return errorResponse({
        error: {
          message: "Falha na redefinição de senha",
          details: result.message,
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.BAD_REQUEST
      })
    }

    // Retorna sucesso
    return successResponse({
      message: "Senha redefinida com sucesso"
    })
  } catch (error) {
    console.error("[AUTH_RESET_PASSWORD_ERROR]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao redefinir senha",
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
      message: "Método não suportado. Use POST para redefinir senha.",
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
      message: "Método não suportado. Use POST para redefinir senha.",
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
      message: "Método não suportado. Use POST para redefinir senha.",
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
      message: "Método não suportado. Use POST para redefinir senha.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 