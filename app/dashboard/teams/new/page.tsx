/**
 * Página de criação de nova equipe
 * Permite que administradores e gerentes criem uma nova equipe
 */

import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamForm } from "@/components/teams/team-form"

/**
 * Página para criação de uma nova equipe
 * @returns Componente de página
 */
export default async function NewTeamPage() {
  // Inicializa o client do Supabase
  const supabase = await createClient()

  // Verifica se o usuário está autenticado e tem uma empresa
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  // Busca os dados do funcionário logado
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", user.id)
    .single()

  // Se não encontrou funcionário ou empresa, redireciona para o dashboard
  if (!employee || !employee.company_id) {
    redirect("/dashboard")
  }

  // Busca os funcionários ativos para o selector de gestor
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, position")
    .eq("company_id", employee.company_id)
    .eq("status", "active")
    .order("full_name")

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <PageHeader
        title="Nova Equipe"
        description="Crie uma nova equipe em sua empresa"
        backButton
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalhes da Equipe</CardTitle>
          <CardDescription>
            Preencha as informações para criar uma nova equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamForm 
            companyId={employee.company_id} 
            employees={employees || []} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
