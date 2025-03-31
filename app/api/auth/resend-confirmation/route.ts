/**
 * API para reenviar email de confirmação
 * Implementa rota para enviar novamente o email de confirmação
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"

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
      return NextResponse.json(
        { 
          success: false, 
          error: "Email não fornecido" 
        },
        { status: 400 }
      )
    }

    // Reenvia o email de confirmação
    const result = await AuthService.resendConfirmationEmail(body.email)

    // Retorna o resultado (sempre retorna sucesso para evitar reconhecimento de emails)
    return NextResponse.json({
      success: true,
      message: "Se o email existir, enviamos um novo email de confirmação."
    })
  } catch (error) {
    console.error("[AUTH_RESEND_CONFIRMATION_ERROR]", error)
    
    // Mesmo em caso de erro, retornamos uma mensagem genérica de sucesso
    // para evitar reconhecimento de emails
    return NextResponse.json({
      success: true,
      message: "Se o email existir, enviamos um novo email de confirmação."
    })
  }
} 