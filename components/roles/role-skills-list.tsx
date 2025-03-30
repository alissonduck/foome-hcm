/**
 * Componente de lista de habilidades de um cargo
 * Exibe as habilidades técnicas e comportamentais de um cargo
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoleTechnicalSkill, RoleBehavioralSkill } from "@/lib/types/roles"
import { EmptyState } from "@/components/empty-state"

interface RoleSkillsListProps {
  technicalSkills: RoleTechnicalSkill[]
  behavioralSkills: RoleBehavioralSkill[]
}

export function RoleSkillsList({ technicalSkills, behavioralSkills }: RoleSkillsListProps) {
  const getSkillLevelColor = (level: string | null) => {
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
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Habilidades Técnicas</CardTitle>
          <CardDescription>Conhecimentos técnicos necessários para o cargo</CardDescription>
        </CardHeader>
        <CardContent>
          {technicalSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {technicalSkills.map((skill) => (
                <Badge key={skill.id} variant="outline" className={getSkillLevelColor(skill.level)}>
                  {skill.name}
                  {skill.level && ` (${skill.level})`}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma habilidade técnica"
              description="Este cargo não possui habilidades técnicas definidas."
              className="h-40"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habilidades Comportamentais</CardTitle>
          <CardDescription>Competências comportamentais necessárias para o cargo</CardDescription>
        </CardHeader>
        <CardContent>
          {behavioralSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {behavioralSkills.map((skill) => (
                <Badge key={skill.id} variant="outline" className={getSkillLevelColor(skill.level)}>
                  {skill.name}
                  {skill.level && ` (${skill.level})`}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma habilidade comportamental"
              description="Este cargo não possui habilidades comportamentais definidas."
              className="h-40"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

