"use client"

/**
 * Componente de barra de navegação inferior para dispositivos móveis
 */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, UserPlus, User } from "lucide-react"

/**
 * Componente de barra de navegação inferior para dispositivos móveis
 * @returns Componente de barra de navegação inferior
 */
export function BottomBar() {
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
      name: "perfil",
      href: "/dashboard/profile",
      icon: User,
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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center px-2 text-xs",
              isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

