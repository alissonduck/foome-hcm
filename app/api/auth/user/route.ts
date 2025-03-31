/**
 * API para obter informações do usuário atual
 * Implementa rota para retornar dados do usuário autenticado
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"

/**
 * GET - Obtém dados do usuário atual
 * 
 * @param request Objeto de requisição
 * @returns Resposta com dados do usuário ou erro
 */
export async function GET(request: NextRequest) {
  try {
    // Obtém usuário atual
    const user = await AuthService.getCurrentUser()

    // Se não encontrou o usuário, retorna 401
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Usuário não autenticado" 
        },
        { status: 401 }
      )
    }

    // Retorna dados do usuário
    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name,
      phone: user.user_metadata?.phone,
      avatarUrl: user.user_metadata?.avatar_url,
      role: user.user_metadata?.role,
    })
  } catch (error) {
    console.error("[AUTH_USER_ERROR]", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao obter dados do usuário",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { status: 500 }
    )
  }
} 