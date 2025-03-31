/**
 * Página de criação de cargo
 * Permite criar um novo cargo
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { RoleForm } from "@/components/roles/role-form"
import { getCurrentCompany } from "@/lib/auth-utils-server"

export const metadata: Metadata = {
  title: "Novo Cargo | Foome",
  description: "Crie um novo cargo para sua empresa",
}

interface NewRolePageProps {
  searchParams: Promise<{
    company?: string
  }>
}

export default async function NewRolePage(props: NewRolePageProps) {
  const searchParams = await props.searchParams;
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
  
  if (!company.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="text-muted-foreground">
          Apenas administradores podem criar novos cargos.
        </p>
      </div>
    )
  }
  
  const companyId = searchParams.company || company.id

  if (!companyId) {
    redirect("/dashboard/roles")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Cargo"
        description="Crie um novo cargo para sua empresa"
        actions={
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/roles">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para Cargos
            </a>
          </Button>
        }
      />

      <Suspense fallback={<div>Carregando formulário...</div>}>
        <RoleForm companyId={companyId} />
      </Suspense>
    </div>
  )
}

