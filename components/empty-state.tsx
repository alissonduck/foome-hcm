"use client"

/**
 * Componente para exibir um estado vazio
 * Usado quando não há dados para exibir em uma lista ou tabela
 */
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Props para o componente EmptyState
 */
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Componente para exibir um estado vazio
 * @param icon Ícone a ser exibido
 * @param title Título do estado vazio
 * @param description Descrição do estado vazio
 * @param action Ação a ser executada (botão)
 * @param className Classes adicionais
 * @returns Componente de estado vazio
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4" variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

