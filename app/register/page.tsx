/**
 * Página de registro
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RegisterForm from "@/components/auth/register-form"
import AuthLayout from "@/components/auth/auth-layout"

/**
 * Página de registro
 * @returns Página de registro com formulário
 */
export default async function RegisterPage() {
  // Verifica se o usuário está autenticado
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se estiver autenticado, redireciona para o dashboard
  if (session) {
    redirect("/dashboard")
  }

  // Se não estiver autenticado, exibe o formulário de registro
  return (
    <AuthLayout title="Criar uma conta" description="Preencha os dados abaixo para criar sua conta">
      <RegisterForm />
    </AuthLayout>
  )
}

