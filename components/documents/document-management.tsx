"use client"

/**
 * Componente de gestão de documentos
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { FileUp, Search, Filter, Download, Eye, CheckCircle, XCircle } from "lucide-react"
import DocumentUploadDialog from "./document-upload-dialog"
import DocumentViewDialog from "./document-view-dialog"

/**
 * Props para o componente DocumentManagement
 */
interface DocumentManagementProps {
  documents: any[]
  employees: any[]
  currentEmployeeId: string
  isAdmin: boolean
}

/**
 * Componente de gestão de documentos
 * @param documents Lista de documentos
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de gestão de documentos
 */
export default function DocumentManagement({
  documents,
  employees,
  currentEmployeeId,
  isAdmin,
}: DocumentManagementProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [employeeFilter, setEmployeeFilter] = useState<string>(isAdmin ? "all" : currentEmployeeId)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * Filtra os documentos com base nos filtros selecionados
   * @returns Lista de documentos filtrada
   */
  const filteredDocuments = documents.filter((doc) => {
    // Filtro por funcionário
    if (employeeFilter !== "all" && doc.employee_id !== employeeFilter) {
      return false
    }

    // Filtro por status
    if (statusFilter !== "all" && doc.status !== statusFilter) {
      return false
    }

    // Filtro por busca (nome do documento ou tipo)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        doc.name.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        (doc.employees?.full_name && doc.employees.full_name.toLowerCase().includes(query))
      )
    }

    return true
  })

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
        throw new Error("Documento não possui arquivo para download")
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
        title: "Erro ao baixar documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao baixar o documento.",
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
        title: "Documento aprovado",
        description: "O documento foi aprovado com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao aprovar documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao aprovar o documento.",
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
        title: "Documento rejeitado",
        description: "O documento foi rejeitado com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao rejeitar o documento.",
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
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    }

    return statusMap[status] || status
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Total de {filteredDocuments.length} documentos</CardDescription>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Enviar Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, tipo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os funcionários</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  {isAdmin && <TableHead>Funcionário</TableHead>}
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                      Nenhum documento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      {isAdmin && <TableCell>{doc.employees?.full_name}</TableCell>}
                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell>{doc.expiration_date ? formatDate(doc.expiration_date) : "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(doc.status)}>
                          {translateDocumentStatus(doc.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDocument(doc)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doc.file_path && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDownloadDocument(doc)}
                              title="Baixar"
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
                                title="Aprovar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRejectDocument(doc.id)}
                                className="text-red-600"
                                title="Rejeitar"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        employees={employees}
        currentEmployeeId={currentEmployeeId}
        isAdmin={isAdmin}
      />

      <DocumentViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} document={selectedDocument} />
    </>
  )
}

