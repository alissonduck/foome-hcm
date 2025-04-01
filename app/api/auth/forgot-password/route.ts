/**
 * API para solicitar redefinição de senha
 * Implementa rota para enviar email de redefinição de senha
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { forgotPasswordSchema } from "@/lib/schemas/auth-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Solicita redefinição de senha
 * 
 * @param request Objeto de requisição com email
 * @returns Resposta com resultado da solicitação
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = forgotPasswordSchema.safeParse(body)

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

    // Solicita redefinição de senha
    const result = await AuthService.forgotPassword({
      email: validationResult.data.email
    })

    // Retorna o resultado (sempre retorna sucesso para evitar reconhecimento de emails)
    return successResponse({
      message: "Se o email existir, enviamos instruções para redefinir sua senha."
    })
  } catch (error) {
    console.error("[AUTH_FORGOT_PASSWORD_ERROR]", error)
    
    // Mesmo em caso de erro, retornamos uma mensagem genérica de sucesso
    // para evitar reconhecimento de emails
    return successResponse({
      message: "Se o email existir, enviamos instruções para redefinir sua senha."
    })
  }
}

/**
 * GET - Método não suportado
 */
export function GET() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para solicitar redefinição de senha.",
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
      message: "Método não suportado. Use POST para solicitar redefinição de senha.",
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
      message: "Método não suportado. Use POST para solicitar redefinição de senha.",
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
      message: "Método não suportado. Use POST para solicitar redefinição de senha.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 