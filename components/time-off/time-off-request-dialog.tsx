"use client"

/**
 * Diálogo para solicitação de férias e ausências
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
import { useToast } from "@/components/ui/use-toast"
import { CalendarPlus } from "lucide-react"
import { createTimeOff } from "@/server/actions/time-off-actions"

/**
 * Props para o componente TimeOffRequestDialog
 */
interface TimeOffRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: any[]
  currentEmployeeId: string
  isAdmin: boolean
}

/**
 * Schema de validação para o formulário de solicitação
 */
const formSchema = z
  .object({
    type: z.string({
      required_error: "Selecione o tipo de ausência.",
    }),
    employeeId: z.string({
      required_error: "Selecione o funcionário.",
    }),
    startDate: z.string({
      required_error: "Selecione a data de início.",
    }),
    endDate: z.string({
      required_error: "Selecione a data de término.",
    }),
    reason: z.string().min(3, {
      message: "O motivo deve ter pelo menos 3 caracteres.",
    }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end >= start
    },
    {
      message: "A data de término deve ser igual ou posterior à data de início.",
      path: ["endDate"],
    },
  )

/**
 * Tipos de ausência disponíveis
 */
const timeOffTypes = [
  { value: "vacation", label: "Férias" },
  { value: "sick_leave", label: "Licença Médica" },
  { value: "maternity_leave", label: "Licença Maternidade" },
  { value: "paternity_leave", label: "Licença Paternidade" },
  { value: "bereavement", label: "Licença Luto" },
  { value: "personal", label: "Licença Pessoal" },
  { value: "other", label: "Outro" },
]

/**
 * Componente de diálogo para solicitação de férias e ausências
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param isAdmin Indica se o usuário é administrador
 * @returns Diálogo para solicitação de férias e ausências
 */
export default function TimeOffRequestDialog({
  open,
  onOpenChange,
  employees,
  currentEmployeeId,
  isAdmin,
}: TimeOffRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      employeeId: currentEmployeeId,
      startDate: "",
      endDate: "",
      reason: "",
    },
  })

  /**
   * Calcula o número de dias entre duas datas
   * @param startDate Data de início
   * @param endDate Data de término
   * @returns Número de dias
   */
  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Inclui o dia de início e término
  }

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Calcula o número de dias
      const totalDays = calculateDays(values.startDate, values.endDate)

      // Cria a solicitação usando a server action
      await createTimeOff({
        employee_id: values.employeeId,
        type: values.type,
        start_date: values.startDate,
        end_date: values.endDate,
        reason: values.reason,
        total_days: totalDays
      })

      // Exibe mensagem de sucesso
      toast({
        title: "Solicitação enviada com sucesso",
        description: "Sua solicitação foi enviada e está aguardando aprovação.",
      })

      // Fecha o diálogo e atualiza a página
      onOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao enviar solicitação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar a solicitação.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação</DialogTitle>
          <DialogDescription>Preencha os dados para solicitar férias ou ausência.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ausência</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de ausência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOffTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o motivo da solicitação" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>
                    {form.watch("startDate") && form.watch("endDate") && (
                      <>Período de {calculateDays(form.watch("startDate"), form.watch("endDate"))} dias</>
                    )}
                  </FormDescription>
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
                  <>Enviando...</>
                ) : (
                  <>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Enviar Solicitação
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

