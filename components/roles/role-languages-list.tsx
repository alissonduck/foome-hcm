/**
 * Componente de lista de idiomas de um cargo
 * Exibe os idiomas necessários para o cargo
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoleLanguage } from "@/lib/types/roles"
import { EmptyState } from "@/components/empty-state"

interface RoleLanguagesListProps {
  languages: RoleLanguage[]
}

export function RoleLanguagesList({ languages }: RoleLanguagesListProps) {
  const getLanguageLevelColor = (level: string | null) => {
    if (!level) return "bg-muted text-muted-foreground"

    switch (level.toLowerCase()) {
      case "básico":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "intermediário":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "avançado":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "fluente":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Idiomas</CardTitle>
        <CardDescription>Idiomas necessários para o cargo</CardDescription>
      </CardHeader>
      <CardContent>
        {languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <Badge
                key={language.id}
                variant={language.is_required ? "default" : "outline"}
                className={language.is_required ? "" : getLanguageLevelColor(language.level)}
              >
                {language.name}
                {language.level && ` (${language.level})`}
                {language.is_required && " (Obrigatório)"}
              </Badge>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum idioma" description="Este cargo não possui idiomas definidos." className="h-40" />
        )}
      </CardContent>
    </Card>
  )
}

