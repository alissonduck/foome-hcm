/**
 * Página principal do dashboard
 */
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Calendar, Clock } from "lucide-react"
import { redirect } from "next/navigation"

// Forçar renderização dinâmica para esta página
export const dynamic = 'force-dynamic'

// Usar o runtime de Node.js para suporte completo a cookies
export const runtime = 'nodejs'

/**
 * Página principal do dashboard
 * @returns Dashboard com estatísticas
 */
export default async function DashboardPage() {
  try {
    // Criar e aguardar o cliente Supabase
    const supabase = await createClient()

    // Busca os dados do usuário autenticado de forma segura
    // Usando getUser() em vez de getSession() para maior segurança
    const { data: { user } } = await supabase.auth.getUser()

    // Verificar se o usuário está autenticado
    if (!user) {
      redirect("/login")
    }

    // Busca os dados do funcionário
    const { data: employee } = await supabase
      .from("employees")
      .select("company_id")
      .eq("user_id", user.id)
      .single()

    // Verificar se o funcionário existe
    if (!employee) {
      redirect("/onboarding")
    }

    // Busca estatísticas de funcionários
    const { data: employeeStats } = await supabase
      .from("employees")
      .select("status")
      .eq("company_id", employee.company_id)

    // Calcula estatísticas
    const totalEmployees = employeeStats?.length || 0
    const activeEmployees = employeeStats?.filter((e) => e.status === "active").length || 0
    const onVacation = employeeStats?.filter((e) => e.status === "vacation").length || 0
    const onLeave = employeeStats?.filter((e) => e.status === "maternity_leave" || e.status === "sick_leave").length || 0

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua empresa e funcionários</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Funcionários cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((activeEmployees / totalEmployees) * 100) || 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Férias</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onVacation}</div>
              <p className="text-xs text-muted-foreground">Funcionários em férias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Licença</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onLeave}</div>
              <p className="text-xs text-muted-foreground">Licença maternidade ou saúde</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas atividades na sua empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">Nenhuma atividade recente</div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Eventos programados para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">Nenhum evento programado</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Erro no Dashboard:", error)
    // Em caso de erro, redirecionamos o usuário para o login
    redirect("/login")
  }
}

