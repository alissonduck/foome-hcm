/**
 * Página de gestão de férias e ausências
 */
import { createClient } from "@/lib/supabase/server"
import TimeOffManagement from "@/components/time-off/time-off-management"

/**
 * Página de gestão de férias e ausências
 * @returns Componente de gestão de férias e ausências
 */
export default async function TimeOffPage() {
  // Adicionar await para resolver a Promise
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

  // Busca as solicitações de férias e ausências
  const { data: timeOffs } = await supabase
    .from("time_off")
    .select(`
      id, 
      type, 
      status, 
      reason, 
      start_date, 
      end_date, 
      total_days, 
      approved_by, 
      approved_at, 
      created_at,
      employee_id,
      employees (
        id, 
        full_name
      ),
      approver:approved_by (
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
        <h1 className="text-3xl font-bold tracking-tight">Férias e Ausências</h1>
        <p className="text-muted-foreground">Gerencie as férias e ausências dos funcionários</p>
      </div>

      <TimeOffManagement
        timeOffs={timeOffs || []}
        employees={employees || []}
        currentEmployeeId={employee?.id}
        isAdmin={employee?.is_admin || false}
      />
    </div>
  )
}

