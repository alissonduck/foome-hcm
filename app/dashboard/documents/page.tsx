import { Metadata } from "next"
import { getDocuments, getCurrentEmployee, getEmployees } from "@/server/actions/document-actions"
import DocumentManagement from "@/components/documents/document-management"
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: "Documentos",
  description: "Gerenciamento de documentos dos funcionários",
}

/**
 * Página de documentos
 * Permite gerenciar os documentos dos funcionários
 */
export default async function DocumentsPage() {
  try {
    // Busca os dados necessários
    const [documents, employee, employees] = await Promise.all([
      getDocuments(),
      getCurrentEmployee(),
      getEmployees()
    ])
    
    if (!employee) {
      return notFound()
    }

    return (
      <div className="flex-1 space-y-4 p-5 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground">
            Gerencie os documentos dos funcionários da empresa
          </p>
        </div>

        <DocumentManagement 
          documents={documents} 
          employees={employees} 
          currentEmployeeId={employee.id}
          isAdmin={!!employee.is_admin}
        />
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar documentos:", error)
    
    return (
      <div className="flex-1 space-y-4 p-5 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground text-red-500">
            Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    )
  }
}

