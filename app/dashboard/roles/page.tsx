/**
 * Página de listagem de cargos
 * Exibe todos os cargos da empresa
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { RoleList } from "@/components/roles/role-list"
import { PageHeader } from "@/components/page-header"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { getRoles } from "@/server/actions/role-actions"

export const metadata: Metadata = {
  title: "Cargos | Foome",
  description: "Gerencie os cargos da sua empresa",
}

export default async function RolesPage() {
  const company = await getCurrentCompany()
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Acesso não autorizado</h1>
        <p className="text-muted-foreground">
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    )
  }
  
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <PageHeader title="Cargos" description="Gerencie os cargos da sua empresa" />

      <Suspense fallback={<div>Carregando cargos...</div>}>
        <RoleList roles={roles} companyId={company.id} />
      </Suspense>
    </div>
  )
}

