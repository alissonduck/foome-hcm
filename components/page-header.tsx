/**
 * Componente de cabeçalho de página
 * Exibe título, descrição e opcionalmente um botão para voltar
 */
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export interface PageHeaderProps {
  title: string
  description?: string
  backButton?: boolean
}

/**
 * Componente de cabeçalho de página
 * @param props Propriedades do componente
 * @returns Componente de cabeçalho
 */
export function PageHeader({ title, description, backButton }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

