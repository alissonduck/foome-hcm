/**
 * Página de movimentações de cargos
 */
import { getEmployeeRoles, getCurrentRole } from "@/server/actions/employee-role-actions"
import { MovimentacoesClient } from "@/components/employees/employee-movements"

/**
 * Página de movimentações de cargos
 * @param params Parâmetros da rota
 * @returns Página de movimentações de cargos
 */
export default async function MovimentacoesPage({ params }: { params: { id: string } }) {
  // Busca as movimentações de cargo
  const roles = await getEmployeeRoles(params.id)
  
  // Busca o cargo atual
  const currentRole = await getCurrentRole(params.id)
  
  return <MovimentacoesClient employeeId={params.id} initialRoles={roles} initialCurrentRole={currentRole} />
} 