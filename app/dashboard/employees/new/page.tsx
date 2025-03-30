/**
 * Página de admissão de funcionário
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EmployeeAdmissionForm from "@/components/employees/employee-admission-form"

/**
 * Página de admissão de funcionário
 * @returns Formulário de admissão de funcionário
 */
export default async function NewEmployeePage() {
  const supabase = await createClient()

  // Verifica se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("company_id, is_admin")
    .eq("user_id", session.user.id)
    .single()

  // Verifica se o usuário é administrador
  if (!employee?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admissão de Funcionário</h1>
        <p className="text-muted-foreground">Preencha o formulário abaixo para admitir um novo funcionário</p>
      </div>

      <EmployeeAdmissionForm companyId={employee.company_id} userId={session.user.id} />
    </div>
  )
}

