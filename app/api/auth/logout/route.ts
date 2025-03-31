/**
 * API para logout de usuários
 * Implementa rota para encerrar a sessão de um usuário
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"

/**
 * POST - Realiza logout de usuário
 * 
 * @param request Objeto de requisição
 * @returns Resposta com resultado do logout
 */
export async function POST(request: NextRequest) {
  try {
    // Realiza logout
    const result = await AuthService.signOut()

    // Se o logout falhou, retorna erro
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 500 }
      )
    }

    // Retorna sucesso
    return NextResponse.json(result)
  } catch (error) {
    console.error("[AUTH_LOGOUT_ERROR]", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao fazer logout",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { status: 500 }
    )
  }
} 