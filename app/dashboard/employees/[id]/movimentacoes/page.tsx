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
  const rolesResponse = await getEmployeeRoles(params.id)
  
  // Busca o cargo atual
  const currentRoleResponse = await getCurrentRole(params.id)
  
  // Extrai os dados das respostas
  const roles = rolesResponse.success ? rolesResponse.data : []
  const currentRole = currentRoleResponse.success ? currentRoleResponse.data : null
  
  // Se houver erros nos dados, exibe mensagem de erro
  if (!rolesResponse.success) {
    console.error("Erro ao buscar movimentações:", rolesResponse.error)
  }
  
  if (!currentRoleResponse.success && currentRoleResponse.error !== "Não foi possível buscar o cargo atual: no rows returned") {
    console.error("Erro ao buscar cargo atual:", currentRoleResponse.error)
  }
  
  return <MovimentacoesClient employeeId={params.id} initialRoles={roles} initialCurrentRole={currentRole} />
} 