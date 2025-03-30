/**
 * Página de gestão de documentos
 */
import { createClient } from "@/lib/supabase/server"
import DocumentManagement from "@/components/documents/document-management"

/**
 * Página de gestão de documentos
 * @returns Componente de gestão de documentos
 */
export default async function DocumentsPage() {
  const supabase = await createClient()

  // Busca os dados do usuário autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", session?.user.id)
    .single()

  // Busca todos os funcionários da empresa para o admin
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("company_id", employee?.company_id)
    .order("full_name")

  // Busca os documentos do funcionário ou de todos os funcionários se for admin
  const { data: documents } = await supabase
    .from("employee_documents")
    .select(`
      id, 
      name, 
      type, 
      status, 
      file_path, 
      file_name, 
      expiration_date, 
      created_at,
      employee_id,
      employees (
        id, 
        full_name
      )
    `)
    .eq(
      employee?.is_admin ? "employees.company_id" : "employee_id",
      employee?.is_admin ? employee?.company_id : employee?.id,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Documentos</h1>
        <p className="text-muted-foreground">Gerencie os documentos dos funcionários da empresa</p>
      </div>

      <DocumentManagement
        documents={documents || []}
        employees={employees || []}
        currentEmployeeId={employee?.id}
        isAdmin={employee?.is_admin || false}
      />
    </div>
  )
}

