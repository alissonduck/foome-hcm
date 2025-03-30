"use client"

/**
 * Componente de navegação lateral para desktop
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  User,
  Calendar,
  Settings,
  Building,
  BriefcaseIcon,
  UsersIcon,
} from "lucide-react"

/**
 * Props para o componente SidebarNav
 */
interface SidebarNavProps {
  isAdmin?: boolean
}

/**
 * Componente de navegação lateral para desktop
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de navegação lateral
 */
export function SidebarNav({ isAdmin = false }: SidebarNavProps) {
  const pathname = usePathname()

  // Lista de itens de navegação
  const navItems = [
    {
      name: "dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "funcionários",
      href: "/dashboard/employees",
      icon: Users,
    },
    {
      name: "equipes",
      href: "/dashboard/teams",
      icon: UsersIcon,
    },
    {
      name: "cargos",
      href: "/dashboard/roles",
      icon: BriefcaseIcon,
    },
    {
      name: "documentos",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      name: "admissão",
      href: "/dashboard/admission",
      icon: UserPlus,
    },
    {
      name: "férias e ausências",
      href: "/dashboard/time-off",
      icon: Calendar,
    },
    {
      name: "perfil",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  // Itens adicionais para administradores
  const adminItems = [
    {
      name: "configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      name: "empresa",
      href: "/dashboard/company",
      icon: Building,
    },
  ]

  /**
   * Verifica se o item está ativo com base no pathname
   * @param href URL do item
   * @returns Verdadeiro se o item estiver ativo
   */
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="hidden md:block space-y-1 py-4">
      <ul className="space-y-1 px-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}

        {isAdmin && (
          <>
            <li className="px-3 py-2 mt-6">
              <div className="text-xs font-medium text-muted-foreground">administração</div>
            </li>
            {adminItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </>
        )}
      </ul>
    </nav>
  )
}

