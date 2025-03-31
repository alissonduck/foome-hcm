/**
 * API para solicitar redefinição de senha
 * Implementa rota para enviar email de redefinição de senha
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { forgotPasswordSchema } from "@/lib/schemas/auth-schema"

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
      return NextResponse.json(
        { 
          success: false, 
          error: "Dados inválidos", 
          issues: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    // Solicita redefinição de senha
    const result = await AuthService.forgotPassword({
      email: validationResult.data.email
    })

    // Retorna o resultado (sempre retorna sucesso para evitar reconhecimento de emails)
    return NextResponse.json({
      success: true,
      message: "Se o email existir, enviamos instruções para redefinir sua senha."
    })
  } catch (error) {
    console.error("[AUTH_FORGOT_PASSWORD_ERROR]", error)
    
    // Mesmo em caso de erro, retornamos uma mensagem genérica de sucesso
    // para evitar reconhecimento de emails
    return NextResponse.json({
      success: true,
      message: "Se o email existir, enviamos instruções para redefinir sua senha."
    })
  }
} 