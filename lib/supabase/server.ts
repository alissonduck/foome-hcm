import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Função que tenta importar os cookies de forma segura
async function getCookies() {
  try {
    // Importação dinâmica para evitar erro em tempo de compilação
    const { cookies } = await import('next/headers')
    return cookies()
  } catch (error) {
    return null
  }
}

export async function createClient() {
  // Tenta obter cookies
  const cookieStore = await getCookies()
  
  // Se não conseguimos acessar os cookies, usamos o cliente básico
  if (!cookieStore) {
    console.warn('Aviso: não foi possível acessar cookies(). Usando cliente básico.')
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  // Se temos acesso aos cookies, usamos o cliente de servidor
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.warn('Aviso: não foi possível definir cookies no Server Component.')
          }
        },
      },
    }
  )
}