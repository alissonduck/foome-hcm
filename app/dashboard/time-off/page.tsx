/**
 * Página de gestão de férias e ausências
 */
import TimeOffManagement from "@/components/time-off/time-off-management"
import { PageHeader } from "@/components/page-header"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { getTimeOffs, getEmployees } from "@/server/actions/time-off-actions"

/**
 * Página de gestão de férias e ausências
 * @returns Componente de gestão de férias e ausências
 */
export default async function TimeOffPage() {
  try {
    // Obtém a empresa atual e o usuário logado
    const company = await getCurrentCompany()
    
    if (!company) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Férias e Ausências"
            description="Gerencie as férias e ausências dos funcionários"
          />
          <div className="p-8 text-center border rounded-md bg-yellow-50 text-yellow-600">
            Você precisa estar conectado para acessar esta página.
          </div>
        </div>
      )
    }

    // Busca os dados usando as server actions
    const [timeOffs, employees] = await Promise.all([
      // Se admin, busca todos. Se não, busca só do funcionário atual
      getTimeOffs(company.isAdmin ? null : company.employeeId),
      getEmployees()
    ])

    return (
      <div className="space-y-6">
        <PageHeader
          title="Férias e Ausências"
          description="Gerencie as férias e ausências dos funcionários"
        />

        <TimeOffManagement
          timeOffs={timeOffs || []}
          employees={employees || []}
          currentEmployeeId={company.employeeId || ""}
          isAdmin={company.isAdmin || false}
        />
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar página de férias e ausências:", error)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Férias e Ausências"
          description="Gerencie as férias e ausências dos funcionários"
        />
        <div className="p-8 text-center border rounded-md bg-red-50 text-red-600">
          Erro ao carregar dados. Por favor, tente novamente mais tarde.
        </div>
      </div>
    )
  }
}

