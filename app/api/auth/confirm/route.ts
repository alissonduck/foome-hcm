/**
 * API para confirmar email manualmente
 * Implementa rota para confirmar email de usuário (para ambiente de desenvolvimento)
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { confirmEmailSchema } from "@/lib/schemas/auth-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Confirma email manualmente
 * 
 * @param request Objeto de requisição com email e senha
 * @returns Resposta com resultado da confirmação
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV === "production") {
      return errorResponse({
        error: {
          message: "Esta rota está disponível apenas em ambiente de desenvolvimento",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }

    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = confirmEmailSchema.safeParse(body)

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

    // Tenta confirmar o email
    const result = await AuthService.confirmEmailManually(
      validationResult.data.email,
      validationResult.data.password
    )

    // Define o status da resposta com base no resultado
    const status = result.success 
      ? HttpStatus.OK 
      : (result.emailNotConfirmed ? 202 : HttpStatus.BAD_REQUEST)

    // Se a confirmação falhou, retorna erro
    if (!result.success) {
      return errorResponse({
        error: {
          message: "Falha na confirmação de email",
          details: result.message,
          code: ErrorCodes.VALIDATION_ERROR
        },
        status
      })
    }

    // Retorna sucesso
    return successResponse({
      message: result.message,
      status
    })
  } catch (error) {
    console.error("[AUTH_CONFIRM_EMAIL_ERROR]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao confirmar email",
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
      message: "Método não suportado. Use POST para confirmar email.",
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
      message: "Método não suportado. Use POST para confirmar email.",
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
      message: "Método não suportado. Use POST para confirmar email.",
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
      message: "Método não suportado. Use POST para confirmar email.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

