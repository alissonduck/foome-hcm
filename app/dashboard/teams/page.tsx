/**
 * Página de listagem de equipes
 */
import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { getCurrentCompany } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase/server"
import { EmptyState } from "@/components/empty-state"
import { UsersIcon } from "lucide-react"

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
  const company = await getCurrentCompany()

  if (!company) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-10 w-10" />}
        title="Empresa não encontrada"
        description="Não foi possível encontrar a empresa associada ao seu usuário."
      />
    )
  }

  // Esperando a resolução da Promise com await
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("company_id", company.id)
    .order("name", { ascending: true })

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
      {teams.map((team: Team) => (
        <Link key={team.id} href={`/dashboard/teams/${team.id}`} className="block">
          <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <h3 className="font-medium">{team.name}</h3>
            {team.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{team.description}</p>}
          </div>
        </Link>
      ))}
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

