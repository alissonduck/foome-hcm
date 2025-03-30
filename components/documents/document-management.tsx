"use client"

/**
 * Componente para gerenciamento de documentos
 */
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, Clock, Eye, FileCheck, FileWarning, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import DocumentUploadDialog from "@/components/documents/document-upload-dialog"
import DocumentViewDialog from "@/components/documents/document-view-dialog"
import { useDocuments } from "@/hooks/use-documents"
import { DocumentFilters, DocumentWithEmployee } from "@/lib/types/documents"

/**
 * Props para o componente DocumentManagement
 */
interface DocumentManagementProps {
  documents: DocumentWithEmployee[]
  employees: any[]
  currentEmployeeId: string
  isAdmin: boolean
}

/**
 * Componente para gerenciamento de documentos
 * @param documents Lista de documentos
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente para gerenciamento de documentos
 */
export default function DocumentManagement({
  documents: initialDocuments,
  employees,
  currentEmployeeId,
  isAdmin,
}: DocumentManagementProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithEmployee | null>(null)
  const [filters, setFilters] = useState<DocumentFilters>({
    status: "all",
    employeeId: isAdmin ? "all" : currentEmployeeId,
    search: "",
  })

  const { translateStatus, useDocumentsQuery } = useDocuments()
  const { data: documents = initialDocuments, isLoading } = useDocumentsQuery(
    filters.employeeId === "all" ? null : filters.employeeId || null,
    "current"
  )

  // Função para abrir o diálogo de visualização
  function handleViewDocument(document: DocumentWithEmployee) {
    setSelectedDocument(document)
    setViewDialogOpen(true)
  }

  // Retorna o ícone de status do documento
  function getStatusIcon(status: string) {
    switch (status) {
      case "approved":
        return <FileCheck className="h-4 w-4 text-green-500" />
      case "rejected":
        return <FileWarning className="h-4 w-4 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value as any })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select
              value={filters.employeeId}
              onValueChange={(value) => setFilters({ ...filters, employeeId: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Funcionário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              {isAdmin && <TableHead>Funcionário</TableHead>}
              <TableHead>Data de Envio</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10">
                  Carregando documentos...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10">
                  Nenhum documento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(doc.status)}
                      <span className="ml-2">{translateStatus(doc.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {doc.employees?.full_name || "N/A"}
                    </TableCell>
                  )}
                  <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {doc.expiration_date
                      ? new Date(doc.expiration_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        employees={employees}
        currentEmployeeId={currentEmployeeId}
        isAdmin={isAdmin}
      />

      {selectedDocument && (
        <DocumentViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          document={selectedDocument}
          isAdmin={isAdmin}
        />
      )}
    </div>
  )
}

