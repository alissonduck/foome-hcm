/**
 * Página de gestão de documentos
 */
import { createClient } from "@/lib/supabase/server"
import { documentService } from "@/lib/services/document-service"
import { PageHeader } from "@/components/page-header"
import DocumentManagement from "@/components/documents/document-management"
import { getCurrentCompany } from "@/lib/auth-utils-server"

/**
 * Página de gestão de documentos
 * @returns Componente de gestão de documentos
 */
export default async function DocumentsPage() {
  const supabase = await createClient()
  const company = await getCurrentCompany()

  if (!company) {
    return <div>Empresa não encontrada</div>
  }

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", company.userId)
    .single()

  // Busca todos os funcionários da empresa para o admin
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("company_id", employee?.company_id)
    .order("full_name")

  // Busca os documentos usando o novo serviço
  const documents = await documentService.getDocuments(
    employee?.is_admin ? null : employee?.id, 
    employee?.company_id
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Documentos"
        description="Gerencie os documentos dos funcionários da empresa"
      />

      <DocumentManagement
        documents={documents || []}
        employees={employees || []}
        currentEmployeeId={employee?.id}
        isAdmin={employee?.is_admin || false}
      />
    </div>
  )
}

