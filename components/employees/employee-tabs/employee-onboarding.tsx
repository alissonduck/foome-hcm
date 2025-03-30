"use client"

/**
 * Componente de onboarding do funcionário
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { ListChecks, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import OnboardingDetailsDialog from "@/components/onboarding/onboarding-details-dialog"

/**
 * Props para o componente EmployeeOnboarding
 */
interface EmployeeOnboardingProps {
  onboardingTasks: any[]
  employeeId: string
  isAdmin: boolean
}

/**
 * Componente de onboarding do funcionário
 * @param onboardingTasks Lista de tarefas de onboarding
 * @param employeeId ID do funcionário
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de onboarding
 */
export default function EmployeeOnboarding({ onboardingTasks, employeeId, isAdmin }: EmployeeOnboardingProps) {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * Abre o diálogo de detalhes da tarefa
   * @param task Tarefa a ser visualizada
   */
  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    setIsDetailsDialogOpen(true)
  }

  /**
   * Completa uma tarefa de onboarding
   * @param taskId ID da tarefa a ser completada
   */
  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("employee_onboarding")
        .update({
          status: "completed",
          completed_by: employeeId,
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId)

      if (error) {
        throw error
      }

      toast({
        title: "tarefa concluída",
        description: "a tarefa foi marcada como concluída com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao concluir tarefa",
        description: error instanceof Error ? error.message : "ocorreu um erro ao concluir a tarefa.",
      })
    }
  }

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
      pending: "pendente",
      completed: "concluído",
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
      documentation: "documentação",
      training: "treinamento",
      system_access: "acesso a sistemas",
      equipment: "equipamentos",
      introduction: "introdução",
      other: "outro",
    }

    return categoryMap[category] || category
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">tarefas de onboarding</h3>
      </div>

      {onboardingTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">nenhuma tarefa de onboarding encontrada para este funcionário.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>tarefa</TableHead>
                <TableHead>categoria</TableHead>
                <TableHead>prazo</TableHead>
                <TableHead>status</TableHead>
                <TableHead>data de conclusão</TableHead>
                <TableHead className="text-right">ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {onboardingTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.onboarding_tasks?.name}</TableCell>
                  <TableCell>
                    {task.onboarding_tasks?.category ? translateTaskCategory(task.onboarding_tasks.category) : "n/a"}
                  </TableCell>
                  <TableCell>{task.due_date ? formatDate(task.due_date) : "n/a"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(task.status)}>
                      {translateOnboardingStatus(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.completed_at ? formatDate(task.completed_at) : "n/a"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleViewTask(task)} title="detalhes">
                        <ListChecks className="h-4 w-4" />
                      </Button>
                      {task.status === "pending" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCompleteTask(task.id)}
                          className="text-green-600"
                          title="concluir"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <OnboardingDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onboarding={selectedTask}
      />
    </div>
  )
}

