/**
 * Página de registro da empresa
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CompanyRegisterForm from "@/components/company/company-register-form"
import { checkUserCompany } from "@/server/actions/register-actions"

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
  const result = await checkUserCompany(session.user.id)
  
  // Se já tiver uma empresa, redireciona para o dashboard
  if (result.success && result.hasCompany) {
    redirect("/dashboard")
  }

  // Se não tiver uma empresa, exibe o formulário de registro
  return (
    <div className="container max-w-4xl py-10">
      <CompanyRegisterForm userId={session.user.id} />
    </div>
  )
}

