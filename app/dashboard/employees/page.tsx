/**
 * Página de listagem de funcionários
 */
import { createClient } from "@/lib/supabase/server"
import EmployeeList from "@/components/employees/employee-list"
import { getCurrentCompany } from "@/lib/auth-utils-server"

/**
 * Página de listagem de funcionários
 * @returns Listagem de funcionários com filtros
 */
export default async function EmployeesPage() {
  const supabase = await createClient()
  
  // Obter a empresa atual
  const company = await getCurrentCompany()
  
  if (!company) {
    return <div className="p-8 text-center">Empresa não encontrada ou usuário não autenticado</div>
  }

  // Busca todos os funcionários da empresa
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", company.id)
    .order("full_name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
        <p className="text-muted-foreground">Gerencie os funcionários da sua empresa</p>
      </div>

      <EmployeeList employees={employees || []} isAdmin={company.isAdmin || false} />
    </div>
  )
}

