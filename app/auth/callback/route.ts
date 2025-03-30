import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Rota de callback para autenticação com Supabase
 * Esta rota é chamada após o processo de autenticação OAuth ou magic link
 * e é responsável por trocar o código de autenticação por uma sessão
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      // Obter o armazenamento de cookies
      const cookieStore = cookies()
      
      // Criar um cliente Supabase com acesso aos cookies
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      })
      
      // Trocar o código por uma sessão
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Erro ao processar callback de autenticação:', error)
    }
  }

  // Redirecionar para o dashboard após a autenticação
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 