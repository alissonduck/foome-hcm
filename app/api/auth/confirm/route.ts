/**
 * API para confirmar email manualmente
 * Implementa rota para confirmar email de usuário (para ambiente de desenvolvimento)
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { confirmEmailSchema } from "@/lib/schemas/auth-schema"

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
      return NextResponse.json(
        { error: "Esta rota está disponível apenas em ambiente de desenvolvimento" },
        { status: 403 }
      )
    }

    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = confirmEmailSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Dados inválidos", 
          issues: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    // Tenta confirmar o email
    const result = await AuthService.confirmEmailManually(
      validationResult.data.email,
      validationResult.data.password
    )

    // Retorna o resultado
    return NextResponse.json(result, {
      status: result.success ? 200 : (result.emailNotConfirmed ? 202 : 400)
    })
  } catch (error) {
    console.error("[AUTH_CONFIRM_EMAIL_ERROR]", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao confirmar email",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { status: 500 }
    )
  }
}

