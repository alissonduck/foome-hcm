/**
 * Página de registro da empresa
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CompanyRegistrationForm from "@/components/company/company-registration-form"

/**
 * Página de registro da empresa
 * @returns Página de registro da empresa com formulário em etapas
 */
export default async function CompanyRegistrationPage() {
  // Verifica se o usuário está autenticado
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não estiver autenticado, redireciona para o login
  if (!session) {
    redirect("/login")
  }

  // Verifica se o usuário já tem uma empresa cadastrada
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id")
    .eq("user_id", session.user.id)
    .single()

  // Se já tiver uma empresa, redireciona para o dashboard
  if (employee?.company_id) {
    redirect("/dashboard")
  }

  // Se não tiver uma empresa, exibe o formulário de registro
  return (
    <div className="container max-w-4xl py-10">
      <CompanyRegistrationForm userId={session.user.id} />
    </div>
  )
}

