"use client"

/**
 * Diálogo para atribuição de tarefas de onboarding
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ListChecks } from "lucide-react"
import { assignTasks } from "@/server/actions/onboarding-actions"

/**
 * Props para o componente OnboardingAssignDialog
 */
interface OnboardingAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: any[]
  employees: any[]
  currentEmployeeId: string
  isAdmin: boolean
}

/**
 * Schema de validação para o formulário de atribuição
 */
const formSchema = z
  .object({
    employeeId: z.string({
      required_error: "Selecione o funcionário.",
    }),
    taskIds: z.array(z.string()).min(1, {
      message: "Selecione pelo menos uma tarefa.",
    }),
    notes: z.string().optional(),
    customDueDate: z.boolean().default(false),
    dueDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.customDueDate) {
        return !!data.dueDate
      }
      return true
    },
    {
      message: "Selecione uma data de prazo.",
      path: ["dueDate"],
    },
  )

/**
 * Componente de diálogo para atribuição de tarefas de onboarding
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param tasks Lista de tarefas
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param isAdmin Indica se o usuário é administrador
 * @returns Diálogo para atribuição de tarefas de onboarding
 */
export default function OnboardingAssignDialog({
  open,
  onOpenChange,
  tasks,
  employees,
  currentEmployeeId,
  isAdmin,
}: OnboardingAssignDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: isAdmin ? "" : currentEmployeeId,
      taskIds: [],
      notes: "",
      customDueDate: false,
      dueDate: "",
    },
  })

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Prepara os dados para inserção
      const onboardingData = values.taskIds.map((taskId) => {
        // Encontra a tarefa para obter o prazo padrão
        const task = tasks.find((t) => t.id === taskId)

        // Calcula a data de prazo
        let dueDate = null
        if (values.customDueDate && values.dueDate) {
          dueDate = values.dueDate
        } else if (task) {
          const date = new Date()
          date.setDate(date.getDate() + task.default_due_days)
          dueDate = date.toISOString().split("T")[0]
        }

        return {
          employee_id: values.employeeId,
          task_id: taskId,
          status: "pending",
          due_date: dueDate,
          notes: values.notes || null,
        }
      })

      // Usa o server action para atribuir as tarefas
      const result = await assignTasks(onboardingData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Exibe mensagem de sucesso
      toast({
        title: "Tarefas atribuídas",
        description: "As tarefas foram atribuídas com sucesso.",
      })

      // Fecha o diálogo e atualiza a página
      onOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao atribuir tarefas",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atribuir as tarefas.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Atribuir Tarefas de Onboarding</DialogTitle>
          <DialogDescription>Selecione as tarefas e o funcionário para atribuição.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isAdmin && (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funcionário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o funcionário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="taskIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Tarefas</FormLabel>
                    <FormDescription>Selecione as tarefas para atribuir ao funcionário.</FormDescription>
                  </div>
                  {tasks.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">Nenhuma tarefa disponível.</div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <FormField
                          key={task.id}
                          control={form.control}
                          name="taskIds"
                          render={({ field }) => {
                            return (
                              <FormItem key={task.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(task.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, task.id])
                                        : field.onChange(field.value?.filter((value) => value !== task.id))
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">{task.name}</FormLabel>
                                  {task.description && (
                                    <FormDescription className="text-xs">{task.description}</FormDescription>
                                  )}
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customDueDate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Definir prazo personalizado</FormLabel>
                    <FormDescription>Marque para definir um prazo personalizado para todas as tarefas</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("customDueDate") && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adicione observações sobre as tarefas" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Atribuindo...</>
                ) : (
                  <>
                    <ListChecks className="mr-2 h-4 w-4" />
                    Atribuir Tarefas
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

