/**
 * Página de detalhes de uma equipe
 * Exibe informações detalhadas de uma equipe específica
 */

import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TeamDetails } from "@/components/teams/team-details"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: TeamPageProps) {
  const params = await props.params;
  // Busca a equipe para o título da página
  const { data: team } = await (await createClient()).from("teams").select("name").eq("id", params.id).single()

  return {
    title: team ? `${team.name} | Equipes | Foome` : "Equipe | Foome",
    description: "Detalhes da equipe",
  }
}

export default async function TeamPage(props: TeamPageProps) {
  const params = await props.params;
  // Verifica se o usuário está autenticado
  const {
    data: { session },
  } = await (await createClient()).auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Busca a equipe com o gestor
  const { data: team, error: teamError } = await (await createClient())
    .from("teams")
    .select(`
      *,
      manager:employees!teams_manager_id_fkey(
        id, full_name, email, position
      )
    `)
    .eq("id", params.id)
    .single()

  if (teamError || !team) {
    notFound()
  }

  // Busca os membros da equipe
  const { data: members, error: membersError } = await (await createClient())
    .from("team_members")
    .select(`
      *,
      employee:employees(
        id, full_name, email, position
      )
    `)
    .eq("team_id", params.id)

  if (membersError) {
    console.error("Erro ao buscar membros da equipe:", membersError)
  }

  // Busca as subequipes
  const { data: subteams, error: subteamsError } = await (await createClient())
    .from("subteams")
    .select(`
      *,
      manager:employees!subteams_manager_id_fkey(
        id, full_name, email, position
      )
    `)
    .eq("team_id", params.id)

  if (subteamsError) {
    console.error("Erro ao buscar subequipes:", subteamsError)
  }

  // Formata os membros
  const formattedMembers = (members || []).map((member: any) => ({
    id: member.employee.id,
    full_name: member.employee.full_name,
    email: member.employee.email,
    position: member.employee.position,
    joined_at: member.joined_at,
  }))

  // Busca os funcionários da empresa para o seletor de gestor
  const { data: employees } = await (await createClient())
    .from("employees")
    .select("id, full_name, position")
    .eq("company_id", team.company_id)
    .eq("status", "active")
    .order("full_name")

  const teamWithDetails = {
    ...team,
    members: formattedMembers,
    subteams: subteams || [],
    member_count: formattedMembers.length,
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<TeamDetailsSkeleton />}>
        <TeamDetails teamId={params.id} initialTeam={teamWithDetails} employees={employees || []} />
      </Suspense>
    </div>
  )
}

function TeamDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

