/**
 * Página de onboarding de funcionários
 */
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import OnboardingManagement from "@/components/onboarding/onboarding-management"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { getOnboardings, getTasks, getEmployees, getCurrentEmployee } from "@/server/actions/onboarding-actions"

/**
 * Página de Onboarding
 * Lista as tarefas de onboarding da empresa e permite gerenciá-las
 */
export default async function OnboardingPage() {
  const company = await getCurrentCompany()
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Acesso não autorizado</h1>
        <p className="text-muted-foreground">
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    )
  }

  // Obter os dados do funcionário atual
  const currentEmployee = await getCurrentEmployee()
  
  // Carregar tarefas de onboarding e onboardings existentes
  const tasks = await getTasks()
  const onboardings = await getOnboardings()
  
  // Carregar lista de funcionários para seleção (se for admin)
  const employees = company.isAdmin ? await getEmployees() : []
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Onboarding"
        description="Gerencie as tarefas de onboarding da sua empresa."
      />
      
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }>
        <OnboardingManagement 
          onboardings={onboardings}
          tasks={tasks}
          employees={employees}
          currentEmployeeId={currentEmployee?.id}
          companyId={company.id}
          isAdmin={company.isAdmin}
        />
      </Suspense>
    </div>
  )
}

