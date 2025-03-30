/**
 * Página de listagem de funcionários
 */
import { createClient } from "@/lib/supabase/server"
import EmployeeList from "@/components/employees/employee-list"

/**
 * Página de listagem de funcionários
 * @returns Listagem de funcionários com filtros
 */
export default async function EmployeesPage() {
  const supabase = await createClient()

  // Busca os dados do funcionário
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("company_id, is_admin")
    .eq("user_id", session?.user.id)
    .single()

  // Busca todos os funcionários da empresa
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", employee?.company_id)
    .order("full_name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
        <p className="text-muted-foreground">Gerencie os funcionários da sua empresa</p>
      </div>

      <EmployeeList employees={employees || []} isAdmin={employee?.is_admin || false} />
    </div>
  )
}

