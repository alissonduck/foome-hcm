"use client"

/**
 * Diálogo para detalhes de onboarding
 */
import { formatDate } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

/**
 * Props para o componente OnboardingDetailsDialog
 */
interface OnboardingDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onboarding: any
}

/**
 * Componente de diálogo para detalhes de onboarding
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param onboarding Onboarding a ser visualizado
 * @returns Diálogo para detalhes de onboarding
 */
export default function OnboardingDetailsDialog({ open, onOpenChange, onboarding }: OnboardingDetailsDialogProps) {
  /**
   * Obtém a cor do badge com base no status
   * @param status Status do onboarding
   * @returns Classe CSS para o badge
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Traduz o status do onboarding para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateOnboardingStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      completed: "Concluído",
    }

    return statusMap[status] || status
  }

  /**
   * Traduz a categoria da tarefa para português
   * @param category Categoria em inglês
   * @returns Categoria traduzida
   */
  const translateTaskCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      documentation: "Documentação",
      training: "Treinamento",
      system_access: "Acesso a Sistemas",
      equipment: "Equipamentos",
      introduction: "Introdução",
      other: "Outro",
    }

    return categoryMap[category] || category
  }

  // Se não houver onboarding selecionado, não renderiza nada
  if (!onboarding) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Tarefa</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge className={getStatusBadgeVariant(onboarding.status)}>
              {translateOnboardingStatus(onboarding.status)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm font-medium">Funcionário</p>
            <p className="text-sm text-muted-foreground">{onboarding.employees?.full_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Tarefa</p>
            <p className="text-sm text-muted-foreground">{onboarding.onboarding_tasks?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Categoria</p>
            <p className="text-sm text-muted-foreground">
              {onboarding.onboarding_tasks?.category
                ? translateTaskCategory(onboarding.onboarding_tasks.category)
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Prazo</p>
            <p className="text-sm text-muted-foreground">
              {onboarding.due_date ? formatDate(onboarding.due_date) : "N/A"}
            </p>
          </div>
          {onboarding.status === "completed" && (
            <>
              <div>
                <p className="text-sm font-medium">Concluído por</p>
                <p className="text-sm text-muted-foreground">{onboarding.completed_by?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Data de Conclusão</p>
                <p className="text-sm text-muted-foreground">
                  {onboarding.completed_at ? formatDate(onboarding.completed_at) : "N/A"}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Descrição da Tarefa</p>
          <div className="rounded-md border p-4 text-sm">
            {onboarding.onboarding_tasks?.description || "Nenhuma descrição disponível."}
          </div>
        </div>

        {onboarding.notes && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Observações</p>
            <div className="rounded-md border p-4 text-sm">{onboarding.notes}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

