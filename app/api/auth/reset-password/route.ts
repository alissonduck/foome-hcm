/**
 * API para redefinir senha
 * Implementa rota para atualizar a senha do usuário
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { resetPasswordSchema } from "@/lib/schemas/auth-schema"

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
      return NextResponse.json(
        { 
          success: false, 
          error: "Dados inválidos", 
          issues: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    // Redefine a senha
    const result = await AuthService.resetPassword({
      password: validationResult.data.password,
      confirmPassword: validationResult.data.confirmPassword
    })

    // Se a redefinição falhou, retorna erro
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      )
    }

    // Retorna sucesso
    return NextResponse.json(result)
  } catch (error) {
    console.error("[AUTH_RESET_PASSWORD_ERROR]", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao redefinir senha",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { status: 500 }
    )
  }
} 