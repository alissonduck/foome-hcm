import type React from "react"
/**
 * Layout do dashboard
 */
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomBar } from "@/components/bottom-bar"
import { SidebarNav } from "@/components/sidebar-nav"

// Forçar renderização dinâmica para este layout
export const dynamic = 'force-dynamic'

// Usar o runtime de Node.js para suporte completo a cookies
export const runtime = 'nodejs'

/**
 * Layout do dashboard
 * @param children Conteúdo do layout
 * @returns Layout do dashboard
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Criar e aguardar o cliente Supabase
    const supabase = await createClient()

    // Verificar se o usuário está autenticado usando método seguro
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    // Busca os dados do funcionário
    const { data: employee } = await supabase
      .from("employees")
      .select("*, companies(name)")
      .eq("user_id", user.id)
      .single()

    if (!employee) {
      redirect("/onboarding")
    }

    // Verifica se o funcionário é administrador
    const isAdmin = employee.is_admin || false

    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={employee} isAdmin={isAdmin} />
        <div className="flex flex-1">
          <aside className="hidden md:block w-64 shrink-0 border-r">
            <SidebarNav isAdmin={isAdmin} />
          </aside>
          <main className="flex-1 pb-16 md:pb-0">
            <div className="container mx-auto py-4 px-4">{children}</div>
          </main>
        </div>
        <BottomBar />
      </div>
    )
  } catch (error) {
    console.error("Erro no layout do dashboard:", error)
    redirect("/login")
  }
}

