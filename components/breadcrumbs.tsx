/**
 * Componente de breadcrumbs para navegação
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

/**
 * Componente de breadcrumbs para navegação
 * @returns Componente de breadcrumbs
 */
export function Breadcrumbs() {
  const pathname = usePathname()

  // Ignora a página inicial do dashboard
  if (pathname === "/dashboard") {
    return null
  }

  // Divide o caminho em segmentos
  const segments = pathname.split("/").filter(Boolean)

  // Cria os itens de breadcrumb
  const breadcrumbs = segments.map((segment, index) => {
    // Constrói o caminho para este segmento
    const path = `/${segments.slice(0, index + 1).join("/")}`

    // Formata o texto do segmento (substitui hífens por espaços)
    const text = segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

    // Verifica se é o último item (atual)
    const isLast = index === segments.length - 1

    return {
      text,
      path,
      isLast,
    }
  })

  return (
    <nav aria-label="breadcrumbs" className="text-sm border-l border-gray-200 dark:border-gray-700 pl-4 ml-4">
      <ol className="flex items-center">
        <li>
          <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            {breadcrumb.isLast ? (
              <span className="text-primary font-medium">{breadcrumb.text}</span>
            ) : (
              <Link href={breadcrumb.path} className="text-gray-500 hover:text-primary transition-colors">
                {breadcrumb.text}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

