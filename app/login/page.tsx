/**
 * Página de login
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LoginForm from "@/components/auth/login-form"
import AuthLayout from "@/components/auth/auth-layout"

// Forçar renderização dinâmica para esta página
export const dynamic = 'force-dynamic'

// Usar o runtime de Node.js para suporte completo a cookies
export const runtime = 'nodejs'

/**
 * Página de login
 * @returns Página de login com formulário
 */
export default async function LoginPage() {
  try {
    // Criar e aguardar o cliente Supabase
    const supabase = await createClient()
    
    // Verificar se o usuário está autenticado usando método seguro
    const { data: { user } } = await supabase.auth.getUser()

    // Se estiver autenticado, redireciona para o dashboard
    if (user) {
      redirect("/dashboard")
    }

    // Se não estiver autenticado, exibe o formulário de login
    return (
      <AuthLayout title="Entrar na sua conta" description="Digite seu e-mail e senha para acessar sua conta">
        <LoginForm />
      </AuthLayout>
    )
  } catch (error) {
    console.error("Erro na página de login:", error)
    
    // Em caso de erro, exibe o formulário de login
    return (
      <AuthLayout title="Entrar na sua conta" description="Digite seu e-mail e senha para acessar sua conta">
        <LoginForm />
      </AuthLayout>
    )
  }
}

