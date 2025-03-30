/**
 * Cabeçalho do dashboard
 */
import { Logo } from "@/components/ui/logo"
import { UserNav } from "@/components/dashboard/user-nav"
import Breadcrumbs from "@/components/dashboard/breadcrumbs"

/**
 * Props para o componente DashboardHeader
 */
interface DashboardHeaderProps {
  employee: {
    id: string
    full_name: string
    company_id: string
    is_admin: boolean
  }
}

/**
 * Componente de cabeçalho do dashboard
 * @param employee Dados do funcionário logado
 * @returns Cabeçalho do dashboard
 */
export default function DashboardHeader({ employee }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo width={100} height={30} />
          <Breadcrumbs />
        </div>
        <div className="flex-shrink-0">
          <UserNav name={employee.full_name} />
        </div>
      </div>
    </header>
  )
}

