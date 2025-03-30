/**
 * Página de listagem de cargos
 * Exibe todos os cargos da empresa
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { RoleList } from "@/components/roles/role-list"
import { PageHeader } from "@/components/page-header"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { roleService } from "@/lib/services/role-service"

export const metadata: Metadata = {
  title: "Cargos | Foome",
  description: "Gerencie os cargos da sua empresa",
}

export default async function RolesPage() {
  const company = await getCurrentCompany()
  const roles = await roleService.getRoles(company.id)

  return (
    <div className="space-y-6">
      <PageHeader title="Cargos" description="Gerencie os cargos da sua empresa" />

      <Suspense fallback={<div>Carregando cargos...</div>}>
        <RoleList roles={roles} companyId={company.id} />
      </Suspense>
    </div>
  )
}

