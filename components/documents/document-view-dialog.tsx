"use client"

/**
 * Diálogo para visualização de documentos
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Clock, FileCheck, FileWarning, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DocumentWithEmployee, DocumentStatus } from "@/lib/types/documents"
import { DocumentActionsClient } from "./document"

/**
 * Props para o componente DocumentViewDialog
 */
interface DocumentViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: DocumentWithEmployee
  isAdmin: boolean
}

/**
 * Componente de diálogo para visualização de documentos
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param document Documento a ser visualizado
 * @param isAdmin Indica se o usuário é administrador
 * @returns Diálogo para visualização de documentos
 */
export default function DocumentViewDialog({
  open,
  onOpenChange,
  document,
  isAdmin,
}: DocumentViewDialogProps) {
  const router = useRouter()
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Utiliza o cliente de ações para documentos
  const documentActions = document?.id 
    ? DocumentActionsClient({ documentId: document.id }) 
    : null

  /**
   * Função para traduzir status do documento
   */
  function translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    }
    return statusMap[status] || "Desconhecido"
  }

  // Função para baixar o documento
  async function downloadDocument() {
    try {
      if (!document || !document.id || !document.file_path || !documentActions) {
        throw new Error("Documento inválido ou não possui arquivo")
      }
      
      setLoading(true)
      
      // Gera URL para download do documento usando server action
      const url = await documentActions.handleGetSignedUrl(document.file_path)
      
      if (!url) {
        throw new Error("Não foi possível gerar o link para o documento")
      }
      
      // Abre em uma nova aba
      window.open(url, '_blank')
    } catch (error) {
      console.error("Erro ao baixar documento:", error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Função para lidar com a mudança de status do documento
   * @param status Novo status do documento
   */
  async function handleStatusChange(status: DocumentStatus) {
    if (!document || !document.id || !documentActions) return
    
    await documentActions.handleUpdateStatus(status)
  }

  /**
   * Função para lidar com a exclusão do documento
   */
  async function handleDelete() {
    if (!document || !document.id || !documentActions) return
    
    const success = await documentActions.handleDelete()
    
    if (success) {
      onOpenChange(false)
    }
  }

  // Retorna o ícone de acordo com o status do documento
  function getStatusIcon() {
    // Verifica se document existe e tem propriedade status
    if (!document || !document.status) {
      // Retorna ícone padrão caso document ou status seja nulo
      return <Clock className="h-5 w-5 text-yellow-500" />
    }
    
    switch (document.status) {
      case "approved":
        return <FileCheck className="h-5 w-5 text-green-500" />
      case "rejected":
        return <FileWarning className="h-5 w-5 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  // Se não houver documento, retorna um diálogo vazio
  if (!document) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Documento não encontrado</DialogTitle>
            <DialogDescription>
              Não foi possível carregar os detalhes do documento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const isActionLoading = documentActions?.isLoading || false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {document.name || "Documento sem nome"}
          </DialogTitle>
          <DialogDescription>
            Tipo: {document.type || "N/A"} • Status: {document.status ? translateStatus(document.status) : "N/A"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Enviado em:</div>
              <div>{document.created_at ? new Date(document.created_at).toLocaleDateString() : "N/A"}</div>
              
              {document.expiration_date && (
                <>
                  <div className="font-medium">Validade:</div>
                  <div>{new Date(document.expiration_date).toLocaleDateString()}</div>
                </>
              )}
              
              <div className="font-medium">Tamanho:</div>
              <div>{document.file_size ? (document.file_size / 1024 / 1024).toFixed(2) : '0'} MB</div>
              
              <div className="font-medium">Nome do arquivo:</div>
              <div className="truncate">{document.file_name || "N/A"}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={downloadDocument}
              disabled={loading || isActionLoading || !document.id || !document.file_path}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>Visualizar/Baixar Documento</>
              )}
            </Button>
          </div>

          {isAdmin && document.status === "pending" && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("approved")}
                disabled={isActionLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
                disabled={isActionLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Rejeitar
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isActionLoading}
          >
            {isActionLoading ? "Excluindo..." : "Excluir Documento"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

