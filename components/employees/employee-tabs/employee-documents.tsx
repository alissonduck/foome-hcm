"use client"

/**
 * Componente de documentos do funcionário
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { FileUp, Download, Eye, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import DocumentUploadDialog from "@/components/documents/document-upload-dialog"
import DocumentViewDialog from "@/components/documents/document-view-dialog"

/**
 * Props para o componente EmployeeDocuments
 */
interface EmployeeDocumentsProps {
  documents: any[]
  employeeId: string
  isAdmin: boolean
}

/**
 * Componente de documentos do funcionário
 * @param documents Lista de documentos
 * @param employeeId ID do funcionário
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de documentos
 */
export default function EmployeeDocuments({ documents, employeeId, isAdmin }: EmployeeDocumentsProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * Abre o diálogo de visualização do documento
   * @param document Documento a ser visualizado
   */
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setIsViewDialogOpen(true)
  }

  /**
   * Baixa o documento
   * @param document Documento a ser baixado
   */
  const handleDownloadDocument = async (document: any) => {
    try {
      if (!document.file_path) {
        throw new Error("documento não possui arquivo para download")
      }

      const { data, error } = await supabase.storage.from("documents").download(document.file_path)

      if (error) {
        throw error
      }

      // Cria um link para download
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = document.file_name || "documento"
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao baixar documento",
        description: error instanceof Error ? error.message : "ocorreu um erro ao baixar o documento.",
      })
    }
  }

  /**
   * Aprova um documento (apenas para admin)
   * @param documentId ID do documento a ser aprovado
   */
  const handleApproveDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.from("employee_documents").update({ status: "approved" }).eq("id", documentId)

      if (error) {
        throw error
      }

      toast({
        title: "documento aprovado",
        description: "o documento foi aprovado com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao aprovar documento",
        description: error instanceof Error ? error.message : "ocorreu um erro ao aprovar o documento.",
      })
    }
  }

  /**
   * Rejeita um documento (apenas para admin)
   * @param documentId ID do documento a ser rejeitado
   */
  const handleRejectDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.from("employee_documents").update({ status: "rejected" }).eq("id", documentId)

      if (error) {
        throw error
      }

      toast({
        title: "documento rejeitado",
        description: "o documento foi rejeitado com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao rejeitar documento",
        description: error instanceof Error ? error.message : "ocorreu um erro ao rejeitar o documento.",
      })
    }
  }

  /**
   * Obtém a cor do badge com base no status
   * @param status Status do documento
   * @returns Classe CSS para o badge
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Traduz o status do documento para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateDocumentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "pendente",
      approved: "aprovado",
      rejected: "rejeitado",
    }

    return statusMap[status] || status
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">documentos do funcionário</h3>
        <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
          <FileUp className="h-4 w-4 mr-2" />
          enviar documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">nenhum documento encontrado para este funcionário.</p>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              enviar primeiro documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>nome</TableHead>
                <TableHead>tipo</TableHead>
                <TableHead>data de envio</TableHead>
                <TableHead>validade</TableHead>
                <TableHead>status</TableHead>
                <TableHead className="text-right">ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>{doc.expiration_date ? formatDate(doc.expiration_date) : "n/a"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(doc.status)}>{translateDocumentStatus(doc.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleViewDocument(doc)} title="visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.file_path && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownloadDocument(doc)}
                          title="baixar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && doc.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproveDocument(doc.id)}
                            className="text-green-600"
                            title="aprovar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRejectDocument(doc.id)}
                            className="text-red-600"
                            title="rejeitar"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        employees={[{ id: employeeId, full_name: "" }]}
        currentEmployeeId={employeeId}
        isAdmin={false}
      />

      <DocumentViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} document={selectedDocument} />
    </div>
  )
}

