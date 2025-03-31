/**
 * Página de detalhes do funcionário
 */
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EmployeeDetails from "@/components/employees/employee-details"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import MovimentacoesPage from "./movimentacoes/page"
import { GitBranch } from "lucide-react"

/**
 * Página de detalhes do funcionário
 * @param params Parâmetros da rota (id do funcionário)
 * @returns Página de detalhes do funcionário
 */
export default async function EmployeeDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Obtém a empresa atual e o usuário logado
  const company = await getCurrentCompany()
  
  if (!company) {
    notFound()
  }

  // Busca os dados do funcionário logado
  const { data: currentEmployee } = await supabase
    .from("employees")
    .select("company_id, is_admin")
    .eq("user_id", company.userId)
    .single()

  if (!currentEmployee) {
    notFound()
  }

  // Busca os dados do funcionário selecionado
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .eq("company_id", currentEmployee.company_id)
    .single()

  if (!employee) {
    notFound()
  }

  // Verifica se o usuário tem permissão para acessar os detalhes
  // (apenas administradores ou o próprio funcionário)
  const canAccess = currentEmployee.is_admin || employee.user_id === company.userId

  if (!canAccess) {
    notFound()
  }

  // Busca documentos do funcionário
  const { data: documents } = await supabase
    .from("employee_documents")
    .select("*")
    .eq("employee_id", params.id)
    .order("created_at", { ascending: false })

  // Busca férias e ausências do funcionário
  const { data: timeOffs } = await supabase
    .from("time_off")
    .select("*")
    .eq("employee_id", params.id)
    .order("created_at", { ascending: false })

  // Busca tarefas de onboarding do funcionário
  const { data: onboardingTasks } = await supabase
    .from("employee_onboarding")
    .select(`
      *,
      onboarding_tasks (
        id,
        name,
        description,
        category,
        is_required
      )
    `)
    .eq("employee_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <EmployeeDetails
        employee={employee}
        documents={documents || []}
        timeOffs={timeOffs || []}
        onboardingTasks={onboardingTasks || []}
        isAdmin={currentEmployee.is_admin}
        currentUserId={company.userId}
        extraTabs={[
          {
            id: "movimentacoes",
            label: "Movimentações",
            content: <MovimentacoesPage params={params} />,
            icon: <GitBranch className="h-4 w-4" />
          }
        ]}
      />
    </div>
  )
}

