"use client"

/**
 * Diálogo para criação/edição de tarefas de onboarding
 */
import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Settings } from "lucide-react"
import { createTask, updateTask } from "@/server/actions/onboarding-actions"

/**
 * Props para o componente OnboardingTaskDialog
 */
interface OnboardingTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  companyId: string
}

/**
 * Schema de validação para o formulário de tarefa
 */
const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome da tarefa deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().optional(),
  category: z.string({
    required_error: "Selecione a categoria da tarefa.",
  }),
  isRequired: z.boolean().default(true),
  defaultDueDays: z.coerce.number().int().min(1, {
    message: "O prazo deve ser de pelo menos 1 dia.",
  }),
})

/**
 * Categorias de tarefas disponíveis
 */
const taskCategories = [
  { value: "documentation", label: "Documentação" },
  { value: "training", label: "Treinamento" },
  { value: "system_access", label: "Acesso a Sistemas" },
  { value: "equipment", label: "Equipamentos" },
  { value: "introduction", label: "Introdução" },
  { value: "other", label: "Outro" },
]

/**
 * Componente de diálogo para criação/edição de tarefas de onboarding
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param task Tarefa a ser editada (null para criação)
 * @param companyId ID da empresa
 * @returns Diálogo para criação/edição de tarefas de onboarding
 */
export default function OnboardingTaskDialog({ open, onOpenChange, task, companyId }: OnboardingTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      isRequired: true,
      defaultDueDays: 7,
    },
  })

  /**
   * Carrega os dados da tarefa quando o diálogo é aberto para edição
   */
  useEffect(() => {
    if (open && task) {
      form.reset({
        name: task.name,
        description: task.description || "",
        category: task.category,
        isRequired: task.is_required,
        defaultDueDays: task.default_due_days,
      })
    } else if (open && !task) {
      form.reset({
        name: "",
        description: "",
        category: "",
        isRequired: true,
        defaultDueDays: 7,
      })
    }
  }, [open, task, form])

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const taskData = {
        name: values.name,
        description: values.description,
        category: values.category,
        is_required: values.isRequired,
        default_due_days: values.defaultDueDays,
        company_id: companyId,
      }

      let result;

      if (task) {
        // Atualiza a tarefa existente
        result = await updateTask(task.id, taskData);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        })
      } else {
        // Cria uma nova tarefa
        result = await createTask(taskData);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast({
          title: "Tarefa criada",
          description: "A tarefa foi criada com sucesso.",
        })
      }

      // Fecha o diálogo e atualiza a página
      onOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao salvar tarefa",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a tarefa.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            {task ? "Edite os detalhes da tarefa de onboarding." : "Crie uma nova tarefa de onboarding."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Tarefa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Enviar documentos pessoais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os detalhes da tarefa" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="defaultDueDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo Padrão (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Dias para conclusão após atribuição</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Obrigatório</FormLabel>
                      <FormDescription>Marque se a tarefa é obrigatória</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    {task ? "Salvar Alterações" : "Criar Tarefa"}
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

