import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Atualiza a sessão do usuário em cada requisição
 * Implementação robusta de manipulação de cookies para evitar problemas de parsing
 * @param request Requisição do Next.js
 * @returns Resposta com sessão atualizada
 */
export async function updateSession(request: NextRequest) {
  // Cria uma resposta inicial
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Cria o cliente Supabase com manipulação personalizada de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = request.cookies.get(name)
          return cookie?.value
        },
        set(name, value, options) {
          // Aplica o cookie na requisição atual
          request.cookies.set(name, value)
          
          // É crucial atualizar a resposta com os novos cookies
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Define o cookie na resposta
          supabaseResponse.cookies.set(name, value, options)
        },
        remove(name, options) {
          // Remove o cookie da requisição atual
          request.cookies.delete(name)
          
          // É crucial atualizar a resposta com os cookies atualizados
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Remove o cookie da resposta
          supabaseResponse.cookies.delete(name)
        },
      },
    }
  )

  // IMPORTANTE: Não execute código entre createServerClient e
  // supabase.auth.getUser(). Um simples erro pode tornar muito difícil depurar
  // problemas com usuários sendo desconectados aleatoriamente.

  // IMPORTANTE: NÃO REMOVA auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redireciona usuários não autenticados para o login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/forgot-password')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: Você *deve* retornar o objeto supabaseResponse como está.
  // Se você estiver criando um novo objeto de resposta com NextResponse.next(),
  // certifique-se de:
  // 1. Passar a requisição nele
  // 2. Copiar os cookies
  // 3. Ajustar o objeto conforme necessário, mas evitar alterar os cookies
  // 4. Retornar o objeto
  // Se isso não for feito, você pode estar causando dessincronização entre
  // navegador e servidor e encerrar prematuramente a sessão do usuário!

  return supabaseResponse
}