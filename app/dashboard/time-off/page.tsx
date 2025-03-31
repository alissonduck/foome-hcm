/**
 * Página de gestão de férias e ausências
 */
import { createClient } from "@/lib/supabase/server"
import TimeOffManagement from "@/components/time-off/time-off-management"
import { TimeOffService } from "@/lib/services/time-off-service"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"
import { PageHeader } from "@/components/page-header"

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

    // Verifica se o usuário é administrador
    const supabase = await createClient()
    const currentUser = await isAdmin(supabase, company.userId)

    // Busca os dados do funcionário
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()

    if (!employee) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Férias e Ausências"
            description="Gerencie as férias e ausências dos funcionários"
          />
          <div className="p-8 text-center border rounded-md bg-yellow-50 text-yellow-600">
            Funcionário não encontrado.
          </div>
        </div>
      )
    }

    // Busca todos os funcionários da empresa para o admin
    const { data: employees } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("company_id", employee.company_id)
      .order("full_name")

    // Busca as solicitações de férias e ausências usando o service
    const timeOffs = await TimeOffService.getTimeOffs(
      currentUser.isAdmin ? null : employee.id, 
      employee.company_id
    )

    return (
      <div className="space-y-6">
        <PageHeader
          title="Férias e Ausências"
          description="Gerencie as férias e ausências dos funcionários"
        />

        <TimeOffManagement
          timeOffs={timeOffs || []}
          employees={employees || []}
          currentEmployeeId={employee.id}
          isAdmin={currentUser.isAdmin}
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

