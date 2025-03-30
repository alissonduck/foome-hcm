"use client"

/**
 * Diálogo para visualização de documentos
 */
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Download, FileText } from "lucide-react"

/**
 * Props para o componente DocumentViewDialog
 */
interface DocumentViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: any
}

/**
 * Componente de diálogo para visualização de documentos
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param document Documento a ser visualizado
 * @returns Diálogo para visualização de documentos
 */
export default function DocumentViewDialog({ open, onOpenChange, document }: DocumentViewDialogProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

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
   * Carrega o documento quando o diálogo é aberto
   */
  useEffect(() => {
    if (open && document?.file_path) {
      loadDocument()
    }

    return () => {
      // Limpa a URL quando o componente é desmontado
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl)
        setDocumentUrl(null)
      }
    }
  }, [open, document])

  /**
   * Carrega o documento do storage
   */
  const loadDocument = async () => {
    try {
      setIsLoading(true)

      // Obtém a URL pública do documento
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(document.file_path, 60) // URL válida por 60 segundos

      if (error) {
        throw error
      }

      setDocumentUrl(data.signedUrl)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar o documento.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Baixa o documento
   */
  const handleDownload = async () => {
    try {
      if (!document?.file_path) {
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

  // Se não houver documento selecionado, não renderiza nada
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{document.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>Tipo: {document.type}</span>
            <span>•</span>
            <Badge className={getStatusBadgeVariant(document.status)}>{translateDocumentStatus(document.status)}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm font-medium">Funcionário</p>
            <p className="text-sm text-muted-foreground">{document.employees?.full_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Data de Envio</p>
            <p className="text-sm text-muted-foreground">{formatDate(document.created_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Validade</p>
            <p className="text-sm text-muted-foreground">
              {document.expiration_date ? formatDate(document.expiration_date) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Arquivo</p>
            <p className="text-sm text-muted-foreground">{document.file_name || "N/A"}</p>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Carregando documento...</p>
            </div>
          ) : documentUrl ? (
            document.file_type?.startsWith("image/") ? (
              <img
                src={documentUrl || "/placeholder.svg"}
                alt={document.name}
                className="w-full h-full object-contain"
              />
            ) : document.file_type === "application/pdf" ? (
              <iframe src={documentUrl} className="w-full h-full" title={document.name} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p>Visualização não disponível para este tipo de arquivo.</p>
                <p className="text-sm text-muted-foreground">Clique em baixar para visualizar o documento.</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Nenhum arquivo disponível.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {document.file_path && (
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

