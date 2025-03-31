/**
 * API para login de usuários
 * Implementa rota para autenticar um usuário com email e senha
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { loginSchema } from "@/lib/schemas/auth-schema"

/**
 * POST - Realiza login de usuário
 * 
 * @param request Objeto de requisição com dados de login
 * @returns Resposta com resultado da autenticação
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = loginSchema.safeParse(body)

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

    // Realiza login
    const result = await AuthService.signIn({
      email: validationResult.data.email,
      password: validationResult.data.password
    })

    // Se o login falhou, retorna erro
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: result.emailNotConfirmed ? 400 : 401 }
      )
    }

    // Retorna sucesso
    return NextResponse.json(result)
  } catch (error) {
    console.error("[AUTH_LOGIN_ERROR]", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao fazer login",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { status: 500 }
    )
  }
} 