/**
 * Página de detalhes do cargo
 * Exibe informações detalhadas de um cargo específico
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { RoleDetails } from "@/components/roles/role-details"
import { RoleService } from "@/lib/services/role-service"

interface RolePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: RolePageProps): Promise<Metadata> {
  const params = await props.params;
  try {
    const role = await RoleService.getRoleWithDetails(params.id)
    return {
      title: `${role.title} | Cargos | Foome`,
      description: `Detalhes do cargo ${role.title}`,
    }
  } catch (error) {
    return {
      title: "Cargo não encontrado | Foome",
      description: "O cargo solicitado não foi encontrado",
    }
  }
}

export default async function RolePage(props: RolePageProps) {
  const params = await props.params;
  try {
    const role = await RoleService.getRoleWithDetails(params.id)

    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalhes do Cargo"
          description="Visualize e gerencie as informações do cargo"
          actions={
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/roles">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar para Cargos
              </a>
            </Button>
          }
        />

        <Suspense fallback={<div>Carregando detalhes do cargo...</div>}>
          <RoleDetails role={role} />
        </Suspense>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

