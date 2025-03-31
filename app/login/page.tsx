/**
 * Página de login
 */
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
export default function LoginPage() {
  return (
    <AuthLayout title="Entrar na sua conta" description="Digite seu e-mail e senha para acessar sua conta">
      <LoginForm />
    </AuthLayout>
  )
}

