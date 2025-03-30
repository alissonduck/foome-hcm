/**
 * Componente de lista de cargos
 * Exibe uma lista de cargos em formato de grade
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RoleCard } from "@/components/roles/role-card"
import type { RoleWithTeam } from "@/lib/types/roles"
import { EmptyState } from "@/components/empty-state"

interface RoleListProps {
  roles: RoleWithTeam[]
  companyId: string
}

export function RoleList({ roles, companyId }: RoleListProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [showInactive, setShowInactive] = useState(false)

  // Filtra os cargos com base na pesquisa e no status de ativo
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      (role.cbo_name && role.cbo_name.toLowerCase().includes(search.toLowerCase())) ||
      (role.cbo_number && role.cbo_number.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = showInactive ? true : role.active

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-sm">
          <Input
            placeholder="Buscar cargos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
            <Label htmlFor="show-inactive">Mostrar inativos</Label>
          </div>
          <Button onClick={() => router.push(`/dashboard/roles/new?company=${companyId}`)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cargo
          </Button>
        </div>
      </div>

      {filteredRoles.length === 0 ? (
        <EmptyState
          title="Nenhum cargo encontrado"
          description="Não foram encontrados cargos com os filtros aplicados."
          action={
            <Button onClick={() => router.push(`/dashboard/roles/new?company=${companyId}`)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Cargo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  )
}

