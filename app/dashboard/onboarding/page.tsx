/**
 * Página de onboarding de funcionários
 */
import { createClient } from "@/lib/supabase/server"
import OnboardingManagement from "@/components/onboarding/onboarding-management"
import { PageHeader } from "@/components/page-header"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"

/**
 * Página de onboarding de funcionários
 * @returns Componente de onboarding de funcionários
 */
export default async function OnboardingPage() {
  const supabase = await createClient()
  
  // Obtém a empresa atual
  const company = await getCurrentCompany()
  
  if (!company) {
    return <div className="p-8 text-center">Empresa não encontrada ou usuário não autenticado</div>
  }

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", company.userId)
    .single()
    
  if (!employee) {
    return <div className="p-8 text-center">Dados do funcionário não encontrados</div>
  }

  // Busca todos os funcionários da empresa para o admin
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("company_id", employee.company_id)
    .order("full_name")

  // Busca as tarefas de onboarding da empresa
  const tasks = await onboardingService.getTasks(employee.company_id)

  // Busca o onboarding dos funcionários
  const onboardings = await onboardingService.getOnboardings(
    employee.company_id,
    employee.is_admin || false,
    employee.id
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding de Funcionários"
        description="Gerencie o processo de onboarding dos funcionários"
      />

      <OnboardingManagement
        onboardings={onboardings || []}
        tasks={tasks || []}
        employees={employees || []}
        currentEmployeeId={employee.id}
        companyId={employee.company_id}
        isAdmin={employee.is_admin || false}
      />
    </div>
  )
}

