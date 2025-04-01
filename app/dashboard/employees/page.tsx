/**
 * Página de listagem de funcionários
 */
import { getEmployees } from "@/server/actions/employee-actions"
import EmployeeList from "@/components/employees/employee-list"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { notFound } from "next/navigation"

/**
 * Página de listagem de funcionários
 * @returns Listagem de funcionários com filtros
 */
export default async function EmployeesPage() {
  // Obter a empresa atual
  const company = await getCurrentCompany()
  
  if (!company) {
    notFound()
  }

  // Busca todos os funcionários da empresa usando Server Action
  const response = await getEmployees()
  
  // Verificar se a busca de funcionários foi bem-sucedida
  const employees = response.success && response.data ? response.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
        <p className="text-muted-foreground">Gerencie os funcionários da sua empresa</p>
      </div>

      <EmployeeList employees={employees} isAdmin={company.isAdmin || false} />
    </div>
  )
}

