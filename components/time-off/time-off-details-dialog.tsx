"use client"

/**
 * Diálogo para detalhes de férias e ausências
 */
import { formatDate } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

/**
 * Props para o componente TimeOffDetailsDialog
 */
interface TimeOffDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeOff: any
}

/**
 * Componente de diálogo para detalhes de férias e ausências
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param timeOff Solicitação a ser visualizada
 * @returns Diálogo para detalhes de férias e ausências
 */
export default function TimeOffDetailsDialog({ open, onOpenChange, timeOff }: TimeOffDetailsDialogProps) {
  /**
   * Obtém a cor do badge com base no status
   * @param status Status da solicitação
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
   * Obtém a cor do badge com base no tipo
   * @param type Tipo da solicitação
   * @returns Classe CSS para o badge
   */
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "vacation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "sick_leave":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "maternity_leave":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
      case "paternity_leave":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
      case "bereavement":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      case "personal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Traduz o status da solicitação para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateTimeOffStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    }

    return statusMap[status] || status
  }

  /**
   * Traduz o tipo da solicitação para português
   * @param type Tipo em inglês
   * @returns Tipo traduzido
   */
  const translateTimeOffType = (type: string) => {
    const typeMap: Record<string, string> = {
      vacation: "Férias",
      sick_leave: "Licença Médica",
      maternity_leave: "Licença Maternidade",
      paternity_leave: "Licença Paternidade",
      bereavement: "Licença Luto",
      personal: "Licença Pessoal",
      other: "Outro",
    }

    return typeMap[type] || type
  }

  // Se não houver solicitação selecionada, não renderiza nada
  if (!timeOff) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Solicitação</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge className={getTypeBadgeVariant(timeOff.type)}>{translateTimeOffType(timeOff.type)}</Badge>
            <span>•</span>
            <Badge className={getStatusBadgeVariant(timeOff.status)}>{translateTimeOffStatus(timeOff.status)}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm font-medium">Funcionário</p>
            <p className="text-sm text-muted-foreground">{timeOff.employees?.full_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Data da Solicitação</p>
            <p className="text-sm text-muted-foreground">{formatDate(timeOff.created_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Período</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(timeOff.start_date)} a {formatDate(timeOff.end_date)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Total de Dias</p>
            <p className="text-sm text-muted-foreground">{timeOff.total_days} dias</p>
          </div>
          {timeOff.status !== "pending" && (
            <>
              <div>
                <p className="text-sm font-medium">Aprovado/Rejeitado por</p>
                <p className="text-sm text-muted-foreground">{timeOff.approver?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Data da Aprovação/Rejeição</p>
                <p className="text-sm text-muted-foreground">
                  {timeOff.approved_at ? formatDate(timeOff.approved_at) : "N/A"}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Motivo</p>
          <div className="rounded-md border p-4 text-sm">{timeOff.reason || "Nenhum motivo informado."}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

