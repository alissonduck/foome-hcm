/**
 * Página de detalhes do funcionário
 */
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EmployeeDetails from "@/components/employees/employee-details"

// Importe o componente de histórico de cargos
import { EmployeeRoleHistory } from "@/components/roles/employee-role-history"
import { Tabs, TabsContent } from "@/components/ui/tabs"

/**
 * Página de detalhes do funcionário
 * @param params Parâmetros da rota (id do funcionário)
 * @returns Página de detalhes do funcionário
 */
export default async function EmployeeDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = createClient()

  // Busca os dados do usuário autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Busca os dados do funcionário logado
  const { data: currentEmployee } = await supabase
    .from("employees")
    .select("company_id, is_admin")
    .eq("user_id", session?.user.id)
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
  const canAccess = currentEmployee.is_admin || employee.user_id === session?.user.id

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
    <EmployeeDetails
      employee={employee}
      documents={documents || []}
      timeOffs={timeOffs || []}
      onboardingTasks={onboardingTasks || []}
      isAdmin={currentEmployee.is_admin}
      currentUserId={session?.user.id}
    >
      {/* Adicione o componente na seção de abas */}
      <Tabs>
        <TabsContent value="professional" className="space-y-6">
          <EmployeeRoleHistory employeeId={employee.id} />
          {/* Outros componentes profissionais */}
        </TabsContent>
      </Tabs>
    </EmployeeDetails>
  )
}

