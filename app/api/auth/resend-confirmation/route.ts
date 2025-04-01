/**
 * API para reenviar email de confirmação
 * Implementa rota para enviar novamente o email de confirmação
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Reenvia email de confirmação
 * 
 * @param request Objeto de requisição com email
 * @returns Resposta com resultado do reenvio
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém os dados da requisição
    const body = await request.json()

    // Verifica se o email foi fornecido
    if (!body.email || typeof body.email !== "string") {
      return errorResponse({
        error: {
          message: "Email não fornecido",
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.BAD_REQUEST
      })
    }

    // Reenvia o email de confirmação
    const result = await AuthService.resendConfirmationEmail(body.email)

    // Retorna o resultado (sempre retorna sucesso para evitar reconhecimento de emails)
    return successResponse({
      message: "Se o email existir, enviamos um novo email de confirmação."
    })
  } catch (error) {
    console.error("[AUTH_RESEND_CONFIRMATION_ERROR]", error)
    
    // Mesmo em caso de erro, retornamos uma mensagem genérica de sucesso
    // para evitar reconhecimento de emails
    return successResponse({
      message: "Se o email existir, enviamos um novo email de confirmação."
    })
  }
}

/**
 * GET - Método não suportado
 */
export function GET() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para reenviar email de confirmação.",
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
      message: "Método não suportado. Use POST para reenviar email de confirmação.",
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
      message: "Método não suportado. Use POST para reenviar email de confirmação.",
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
      message: "Método não suportado. Use POST para reenviar email de confirmação.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 