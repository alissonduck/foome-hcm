/**
 * API para login de usuários
 * Implementa rota para autenticar um usuário com email e senha
 */

import { NextRequest } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { loginSchema } from "@/lib/schemas/auth-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"

/**
 * POST - Realiza login de usuário
 * 
 * @param request Objeto de requisição com dados de login
 * @returns Resposta com resultado da autenticação
 */
export async function POST(request: NextRequest) {
  console.log("[API_LOGIN] Recebida requisição de login")
  
  try {
    // Obtém os dados da requisição
    const body = await request.json()
    
    console.log("[API_LOGIN] Body recebido:", { 
      email: body.email, 
      temSenha: !!body.password 
    })

    // Valida os dados
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      console.log("[API_LOGIN] Falha na validação:", validationResult.error.format())
      
      return errorResponse({
        error: {
          message: "Dados inválidos",
          details: validationResult.error.format(),
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    console.log("[API_LOGIN] Dados validados, tentando login")

    // Realiza login
    const result = await AuthService.signIn({
      email: validationResult.data.email,
      password: validationResult.data.password
    })

    console.log("[API_LOGIN] Resultado do login:", { 
      success: result.success, 
      emailNotConfirmed: result.emailNotConfirmed,
      session: !!result.session
    })

    // Se o login falhou, retorna erro
    if (!result.success) {
      return errorResponse({
        error: {
          message: result.message || "Falha na autenticação",
          code: result.emailNotConfirmed 
            ? ErrorCodes.VALIDATION_ERROR 
            : ErrorCodes.AUTHENTICATION_ERROR
        },
        status: result.emailNotConfirmed 
          ? HttpStatus.BAD_REQUEST 
          : HttpStatus.UNAUTHORIZED
      })
    }

    // Retorna sucesso
    return successResponse({
      data: {
        user: result.user,
        session: result.session
      },
      message: "Login realizado com sucesso"
    })
  } catch (error) {
    console.error("[API_LOGIN] Erro:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao fazer login",
        details: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação.",
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * GET, PUT, PATCH, DELETE - Métodos não suportados
 */
export function GET() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para login.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

export function PUT() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para login.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

export function PATCH() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para login.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não suportado. Use POST para login.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 