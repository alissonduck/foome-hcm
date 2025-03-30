import { createServerClient } from '@supabase/ssr'

export async function createClient(cookieObj = null) {
  let cookieStore;
  
  // Verifica se estamos em um ambiente App Router ou Pages Router
  if (!cookieObj) {
    try {
      // Isso vai falhar no Pages Router
      const { cookies } = await import('next/headers')
      cookieStore = await cookies()
    } catch (e) {
      // Fallback para Pages Router - use os cookies de contexto
      cookieStore = cookieObj
    }
  } else {
    cookieStore = cookieObj
  }
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore?.get(name)?.value
        },
        set(name, value, options) {
          if (cookieStore) {
            cookieStore.set({ name, value, ...options })
          }
        },
        remove(name, options) {
          if (cookieStore) {
            cookieStore.delete({ name, ...options })
          }
        },
      },
    }
  )
}