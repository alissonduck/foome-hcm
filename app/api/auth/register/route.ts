/**
 * API para registro de usuários
 * Implementa rota para criar um novo usuário no sistema
 */

import { NextRequest } from "next/server"
import { userRegisterSchema } from "@/lib/schemas/register-schema"
import { registerUser } from "@/server/actions/register-actions"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Registra um novo usuário
 * 
 * @param request Objeto de requisição com dados do usuário
 * @returns Resposta com resultado do registro
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = userRegisterSchema.safeParse(body)

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

    // Utiliza a server action para realizar o registro
    const result = await registerUser({
      fullName: validationResult.data.fullName,
      email: validationResult.data.email,
      password: validationResult.data.password,
      phone: validationResult.data.phone,
    })

    // Se o registro falhou, retorna erro
    if (!result.success) {
      return errorResponse({
        error: {
          message: result.error || "Falha no registro",
          details: result.message,
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.BAD_REQUEST
      })
    }

    // Retorna sucesso
    return successResponse({
      data: result.data,
      message: "Registro realizado com sucesso. Verifique seu email para confirmar sua conta.",
      status: HttpStatus.CREATED
    })
  } catch (error) {
    console.error("[AUTH_REGISTER_ERROR]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao fazer registro",
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
      message: "Método não suportado. Use POST para registrar um usuário.",
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
      message: "Método não suportado. Use POST para registrar um usuário.",
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
      message: "Método não suportado. Use POST para registrar um usuário.",
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
      message: "Método não suportado. Use POST para registrar um usuário.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 