/**
 * Barra lateral do dashboard
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  UserPlus,
  BarChart3,
  Settings,
  Calendar,
  FileText,
  Building,
  ListChecks,
  UsersRound,
} from "lucide-react"

/**
 * Props para o componente DashboardSidebar
 */
interface DashboardSidebarProps {
  isAdmin: boolean
}

/**
 * Componente de barra lateral do dashboard
 * @param isAdmin Indica se o usuário é administrador
 * @returns Barra lateral do dashboard
 */
export default function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  return (
    <div className="hidden md:block w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 shadow-inner">
      <div className="flex h-full flex-col py-6">
        <div className="px-3 py-2">
          <h2 className="mb-4 px-4 text-lg font-semibold tracking-tight">Menu Principal</h2>
          <div className="space-y-1">
            <NavItems isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de itens de navegação
 * @param isAdmin Indica se o usuário é administrador
 * @returns Itens de navegação
 */
function NavItems({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  // Itens de navegação comuns
  const items = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Funcionários",
      href: "/dashboard/employees",
      icon: Users,
    },
    {
      title: "Equipes",
      href: "/dashboard/teams",
      icon: UsersRound,
    },
    {
      title: "Documentos",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Férias e Ausências",
      href: "/dashboard/time-off",
      icon: Calendar,
    },
    {
      title: "Onboarding",
      href: "/dashboard/onboarding",
      icon: ListChecks,
    },
  ]

  // Itens de navegação apenas para administradores
  const adminItems = [
    {
      title: "Admissão",
      href: "/dashboard/employees/new",
      icon: UserPlus,
    },
    {
      title: "Empresa",
      href: "/dashboard/company",
      icon: Building,
    },
    {
      title: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  // Combina os itens com base no perfil do usuário
  const navItems = isAdmin ? [...items, ...adminItems] : items

  return (
    <nav className="grid gap-1 px-2">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
            pathname === item.href
              ? "bg-primary/10 text-primary dark:bg-primary/20"
              : "text-gray-700 dark:text-gray-300",
          )}
        >
          <item.icon
            className={cn("h-4 w-4", pathname === item.href ? "text-primary" : "text-gray-500 dark:text-gray-400")}
          />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

