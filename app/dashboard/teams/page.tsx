/**
 * Página de listagem de equipes
 */
import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/empty-state"
import { UsersIcon } from "lucide-react"

// Configuração para desativar cache e garantir dados atualizados
export const dynamic = "force-dynamic"
export const revalidate = 0

// Defina a interface para equipe
interface Team {
  id: string;
  name: string;
  description?: string;
  company_id: string;
}

/**
 * Componente para listar equipes
 * @returns Componente de listagem de equipes
 */
async function TeamsList() {
  const supabase = await createClient()

  // Busca o usuário atual
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-10 w-10" />}
        title="Usuário não autenticado"
        description="Você precisa estar logado para visualizar as equipes."
      />
    )
  }

  // Busca o funcionário e sua empresa diretamente
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", user.id)
    .single()

  if (!employee || !employee.company_id) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-10 w-10" />}
        title="Empresa não encontrada"
        description="Não foi possível encontrar a empresa associada ao seu usuário."
      />
    )
  }

  // Consulta aprimorada para buscar equipes com informações do gestor
  const { data: teams, error } = await supabase
    .from("teams")
    .select(`
      *,
      manager:manager_id(id, full_name, position)
    `)
    .eq("company_id", employee.company_id)
    .order("name", { ascending: true })

  // Adicionando logs para debug
  console.log("Empresa ID:", employee.company_id)
  console.log("Equipes encontradas:", teams?.length || 0)
  
  if (error) {
    console.error("Erro ao carregar equipes:", error)
    return (
      <EmptyState
        icon={<UsersIcon className="h-10 w-10" />}
        title="Erro ao carregar equipes"
        description="Não foi possível carregar as equipes. Tente novamente mais tarde."
      />
    )
  }

  if (!teams || teams.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-10 w-10" />}
        title="Nenhuma equipe encontrada"
        description="Você ainda não tem equipes cadastradas."
        action={{
          label: "Criar equipe",
          onClick: () => (window.location.href = "/dashboard/teams/new"),
        }}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.isArray(teams) && teams.length > 0 ? (
        teams.map((team: Team) => (
          <Link key={team.id} href={`/dashboard/teams/${team.id}`} className="block">
            <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <h3 className="font-medium">{team.name}</h3>
              {team.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{team.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">ID: {team.id}</p>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-3">
          <p>Nenhuma equipe encontrada (array verificado)</p>
        </div>
      )}
    </div>
  )
}

/**
 * Página de listagem de equipes
 * @returns Página de listagem de equipes
 */
export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipes"
        description="Gerencie as equipes da sua empresa"
        actions={
          <Button asChild>
            <Link href="/dashboard/teams/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Equipe
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<div>Carregando equipes...</div>}>
        <TeamsList />
      </Suspense>
    </div>
  )
}

