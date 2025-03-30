/**
 * Componente de cabeçalho de página
 * Exibe o título da página e ações opcionais
 */
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Props para o componente PageHeader
 */
interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/**
 * Componente de cabeçalho de página
 * @param title Título da página
 * @param description Descrição da página
 * @param actions Ações a serem exibidas no cabeçalho
 * @param className Classes adicionais
 * @returns Componente de cabeçalho de página
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

