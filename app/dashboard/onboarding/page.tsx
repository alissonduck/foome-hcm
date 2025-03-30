/**
 * Página de onboarding de funcionários
 */
import { createClient } from "@/lib/supabase/server"
import OnboardingManagement from "@/components/onboarding/onboarding-management"

/**
 * Página de onboarding de funcionários
 * @returns Componente de onboarding de funcionários
 */
export default async function OnboardingPage() {
  const supabase = await createClient()

  // Busca os dados do usuário autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", session?.user.id)
    .single()

  // Busca todos os funcionários da empresa para o admin
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("company_id", employee?.company_id)
    .order("full_name")

  // Busca as tarefas de onboarding da empresa
  const { data: tasks } = await supabase
    .from("onboarding_tasks")
    .select("*")
    .eq("company_id", employee?.company_id)
    .order("name")

  // Busca o onboarding dos funcionários
  const { data: onboardings } = await supabase
    .from("employee_onboarding")
    .select(`
      id, 
      status, 
      due_date, 
      notes, 
      completed_at, 
      created_at,
      employee_id,
      task_id,
      employees (
        id, 
        full_name
      ),
      onboarding_tasks (
        id,
        name,
        description,
        category,
        is_required
      ),
      completed_by (
        full_name
      )
    `)
    .eq(
      employee?.is_admin ? "employees.company_id" : "employee_id",
      employee?.is_admin ? employee?.company_id : employee?.id,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboarding de Funcionários</h1>
        <p className="text-muted-foreground">Gerencie o processo de onboarding dos funcionários</p>
      </div>

      <OnboardingManagement
        onboardings={onboardings || []}
        tasks={tasks || []}
        employees={employees || []}
        currentEmployeeId={employee?.id}
        companyId={employee?.company_id}
        isAdmin={employee?.is_admin || false}
      />
    </div>
  )
}

