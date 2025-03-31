/**
 * API para registro de usuários
 * Implementa rota para criar um novo usuário
 */

import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { registerSchema } from "@/lib/schemas/auth-schema"

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
    const validationResult = registerSchema.safeParse(body)

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

    // Realiza o registro
    const result = await AuthService.signUp({
      fullName: validationResult.data.fullName,
      email: validationResult.data.email,
      password: validationResult.data.password,
      phone: validationResult.data.phone,
    })

    // Se o registro falhou, retorna erro
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      )
    }

    // Retorna sucesso
    return NextResponse.json(result)
  } catch (error) {
    console.error("[AUTH_REGISTER_ERROR]", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao fazer registro",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { status: 500 }
    )
  }
} 