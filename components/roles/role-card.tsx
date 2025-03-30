/**
 * Componente de cartão de cargo
 * Exibe informações resumidas de um cargo em formato de cartão
 */
"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { RoleWithTeam } from "@/lib/types/roles"

interface RoleCardProps {
  role: RoleWithTeam
}

export function RoleCard({ role }: RoleCardProps) {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <Link href={`/dashboard/roles/${role.id}`} className="block h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-bold">{role.title}</CardTitle>
            {!role.active && (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                Inativo
              </Badge>
            )}
          </div>
          {role.team && <CardDescription>Equipe: {role.team.name}</CardDescription>}
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tipo de Contrato:</span>
              <span className="font-medium capitalize">{role.contract_type}</span>
            </div>
            {role.level && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nível:</span>
                <span className="font-medium capitalize">{role.level}</span>
              </div>
            )}
            {role.work_model && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Modelo de Trabalho:</span>
                <span className="font-medium capitalize">{role.work_model}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex w-full items-center justify-between text-sm">
            <span className="text-muted-foreground">CBO:</span>
            <span className="font-medium">{role.cbo_number || "Não informado"}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

