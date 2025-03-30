/**
 * Página de gestão de documentos
 */
import { createClient } from "@/lib/supabase/server"
import { documentService } from "@/lib/services/document-service"
import { PageHeader } from "@/components/page-header"
import DocumentManagement from "@/components/documents/document-management"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { redirect } from "next/navigation"

/**
 * Página de gestão de documentos
 * @returns Componente de gestão de documentos
 */
export default async function DocumentsPage() {
  const supabase = await createClient()
  const company = await getCurrentCompany()

  if (!company) {
    return <div className="p-8 text-center">Empresa não encontrada ou usuário não autenticado</div>
  }

  // Busca os dados do funcionário
  const { data: employee } = await supabase
    .from("employees")
    .select("id, company_id, is_admin")
    .eq("user_id", company.userId)
    .single()

  if (!employee || !employee.company_id) {
    return <div className="p-8 text-center">Dados do funcionário não encontrados ou incompletos</div>
  }

  // Busca todos os funcionários da empresa para o admin
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("company_id", employee.company_id)
    .order("full_name")

  try {
    // Busca os documentos usando o novo serviço
    const documents = await documentService.getDocuments(
      employee.is_admin ? null : employee.id, 
      employee.company_id
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
          currentEmployeeId={employee.id}
          isAdmin={employee.is_admin || false}
        />
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar documentos:", error)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Documentos"
          description="Gerencie os documentos dos funcionários da empresa"
        />
        <div className="p-8 text-center border rounded-md bg-red-50 text-red-600">
          Erro ao carregar documentos. Por favor, tente novamente mais tarde.
        </div>
      </div>
    )
  }
}

