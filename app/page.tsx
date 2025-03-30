/**
 * Página inicial da aplicação
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LandingPage from "@/components/landing/landing-page"

/**
 * Página inicial da aplicação
 * Redireciona para o dashboard se o usuário estiver autenticado
 * @returns Página inicial ou redirecionamento
 */
export default async function Home() {
  // Verifica se o usuário está autenticado
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redireciona para o dashboard se o usuário estiver autenticado
  if (session) {
    redirect("/dashboard")
  }

  // Renderiza a página inicial
  return <LandingPage />
}

