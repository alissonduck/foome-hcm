"use client"

/**
 * Componente client que lida com as ações de documentos usando as Server Actions
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { DocumentStatus } from "@/lib/types/documents"
import { updateDocumentStatus, deleteDocument, getSignedUrl } from "@/server/actions/document-actions"

interface DocumentActionsClientProps {
  documentId: string
}

export function DocumentActionsClient({ documentId }: DocumentActionsClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  /**
   * Atualiza o status de um documento
   */
  async function handleUpdateStatus(status: DocumentStatus) {
    try {
      setIsLoading(true)
      const result = await updateDocumentStatus(documentId, status)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const statusMessage = status === "approved" ? "aprovado" : "rejeitado"
      toast({
        title: "Status atualizado",
        description: `O documento foi ${statusMessage} com sucesso.`,
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o status do documento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Remove um documento
   */
  async function handleDelete() {
    try {
      setIsLoading(true)
      const result = await deleteDocument(documentId)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      })
      
      router.refresh()
      return true
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o documento.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Obtém uma URL assinada para visualizar o documento
   */
  async function handleGetSignedUrl(filePath: string) {
    try {
      setIsLoading(true)
      const result = await getSignedUrl(filePath)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.url
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o link para o documento.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleUpdateStatus,
    handleDelete,
    handleGetSignedUrl,
  }
} 