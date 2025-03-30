/**
 * Barra de navegação inferior para dispositivos móveis
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, BarChart3, Calendar, FileText, ListChecks, UsersRound } from "lucide-react"

/**
 * Componente de barra de navegação inferior para dispositivos móveis
 * @returns Barra de navegação inferior
 */
export default function BottomBar() {
  const pathname = usePathname()

  // Itens de navegação para a barra inferior
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
      title: "Ausências",
      href: "/dashboard/time-off",
      icon: Calendar,
    },
    {
      title: "Onboarding",
      href: "/dashboard/onboarding",
      icon: ListChecks,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-950 dark:border-gray-800">
      <div className="grid h-full grid-cols-6">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "inline-flex flex-col items-center justify-center px-1 hover:bg-gray-50 dark:hover:bg-gray-800",
              pathname === item.href ? "text-primary" : "text-gray-500 dark:text-gray-400",
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 mb-1",
                pathname === item.href ? "text-primary" : "text-gray-500 dark:text-gray-400",
              )}
            />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

