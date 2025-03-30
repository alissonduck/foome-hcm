/**
 * Página de detalhes de uma subequipe
 * Exibe informações detalhadas de uma subequipe específica
 */

import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { supabaseServer } from "@/lib/supabase/server"
import { SubteamDetails } from "@/components/teams/subteam-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface SubteamPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: SubteamPageProps) {
  const params = await props.params;
  // Busca a subequipe para o título da página
  const { data: subteam } = await supabaseServer().from("subteams").select("name").eq("id", params.id).single()

  return {
    title: subteam ? `${subteam.name} | Subequipes | Foome` : "Subequipe | Foome",
    description: "Detalhes da subequipe",
  }
}

export default async function SubteamPage(props: SubteamPageProps) {
  const params = await props.params;
  // Verifica se o usuário está autenticado
  const {
    data: { session },
  } = await supabaseServer().auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Busca a subequipe com o gestor
  const { data: subteam, error: subteamError } = await supabaseServer()
    .from("subteams")
    .select(`
      *,
      manager:employees!subteams_manager_id_fkey(
        id, full_name, email, position
      )
    `)
    .eq("id", params.id)
    .single()

  if (subteamError || !subteam) {
    notFound()
  }

  // Busca os membros da subequipe
  const { data: members, error: membersError } = await supabaseServer()
    .from("subteam_members")
    .select(`
      *,
      employee:employees(
        id, full_name, email, position
      )
    `)
    .eq("subteam_id", params.id)

  if (membersError) {
    console.error("Erro ao buscar membros da subequipe:", membersError)
  }

  // Formata os membros
  const formattedMembers = (members || []).map((member: any) => ({
    id: member.employee.id,
    full_name: member.employee.full_name,
    email: member.employee.email,
    position: member.employee.position,
    joined_at: member.joined_at,
  }))

  // Busca a equipe pai para obter a company_id
  const { data: team } = await supabaseServer().from("teams").select("company_id").eq("id", subteam.team_id).single()

  // Busca os funcionários da empresa para o seletor de gestor
  const { data: employees } = await supabaseServer()
    .from("employees")
    .select("id, full_name, position")
    .eq("company_id", team?.company_id || "")
    .eq("status", "active")
    .order("full_name")

  const subteamWithDetails = {
    ...subteam,
    members: formattedMembers,
    member_count: formattedMembers.length,
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <Suspense fallback={<SubteamDetailsSkeleton />}>
        <SubteamDetails subteamId={params.id} initialSubteam={subteamWithDetails} employees={employees || []} />
      </Suspense>
    </div>
  )
}

function SubteamDetailsSkeleton() {
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

