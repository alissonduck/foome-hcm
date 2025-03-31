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
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Dados inválidos", 
          issues: validationResult.error.format() 
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
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
      return NextResponse.json(
        result,
        { 
          status: result.emailNotConfirmed ? 400 : 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Retorna sucesso
    const response = NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log("[API_LOGIN] Resposta de sucesso enviada:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    return response
  } catch (error) {
    console.error("[API_LOGIN] Erro:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao fazer login",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação."
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 