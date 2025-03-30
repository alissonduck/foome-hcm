/**
 * Componente de cabeçalho do dashboard
 */
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { Breadcrumbs } from "@/components/breadcrumbs"

/**
 * Props para o componente DashboardHeader
 */
interface DashboardHeaderProps {
  user: any
  isAdmin?: boolean
}

/**
 * Componente de cabeçalho do dashboard
 * @param user Dados do usuário
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de cabeçalho do dashboard
 */
export function DashboardHeader({ user, isAdmin = false }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav isAdmin={isAdmin} />
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/foome_logo.svg" alt="foome" className="h-8" />
          </Link>
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex items-center">
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}

