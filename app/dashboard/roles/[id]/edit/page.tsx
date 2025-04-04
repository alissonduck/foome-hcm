/**
 * Página de edição de cargo
 * Permite editar um cargo existente
 */
import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { RoleForm } from "@/components/roles/role-form"
import { getRoleWithDetails } from "@/server/actions/role-actions"
import { getCurrentCompany } from "@/lib/auth-utils-server"

interface EditRolePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: EditRolePageProps): Promise<Metadata> {
  const params = await props.params;
  try {
    const role = await getRoleWithDetails(params.id)
    return {
      title: `Editar ${role.title} | Cargos | Foome`,
      description: `Edite as informações do cargo ${role.title}`,
    }
  } catch (error) {
    return {
      title: "Cargo não encontrado | Foome",
      description: "O cargo solicitado não foi encontrado",
    }
  }
}

export default async function EditRolePage(props: EditRolePageProps) {
  const params = await props.params;
  
  // Verifica autenticação e permissões
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
          Apenas administradores podem editar cargos.
        </p>
      </div>
    )
  }
  
  try {
    const role = await getRoleWithDetails(params.id)

    // Verifica se o cargo pertence à empresa do usuário logado
    if (role.company_id !== company.id) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold">Acesso negado</h1>
          <p className="text-muted-foreground">
            Este cargo não pertence à sua empresa.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Cargo"
          description="Atualize as informações do cargo"
          actions={
            <Button variant="outline" size="sm" asChild>
              <a href={`/dashboard/roles/${params.id}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar para Detalhes
              </a>
            </Button>
          }
        />

        <Suspense fallback={<div>Carregando formulário...</div>}>
          <RoleForm
            companyId={role.company_id}
            initialData={{
              ...role,
              id: role.id,
              company_id: role.company_id,
              team_id: role.team?.id || null,
              courses: role.courses,
              complementary_courses: role.complementary_courses,
              technical_skills: role.technical_skills,
              behavioral_skills: role.behavioral_skills,
              languages: role.languages,
            }}
            isEditing
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

