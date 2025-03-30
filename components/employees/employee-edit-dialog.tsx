"use client"

/**
 * Diálogo para edição de funcionário
 */
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { EmployeeStatus } from "@/lib/types"

/**
 * Props para o componente EmployeeEditDialog
 */
interface EmployeeEditDialogProps {
  employee: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Schema de validação para o formulário de edição
 */
const formSchema = z.object({
  // Dados pessoais
  fullName: z.string().min(3, {
    message: "O nome completo deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Digite um e-mail válido.",
  }),
  phone: z.string().min(10, {
    message: "Digite um telefone válido.",
  }),
  status: z.string(),

  // Dados profissionais
  position: z.string().min(2, {
    message: "Digite um cargo válido.",
  }),
  department: z.string().min(2, {
    message: "Digite um departamento válido.",
  }),
})

/**
 * Componente de diálogo para edição de funcionário
 * @param employee Dados do funcionário
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @returns Diálogo para edição de funcionário
 */
export default function EmployeeEditDialog({ employee, open, onOpenChange }: EmployeeEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      status: "",
      position: "",
      department: "",
    },
  })

  // Carrega os dados do funcionário quando o diálogo é aberto
  useEffect(() => {
    if (open && employee) {
      form.reset({
        fullName: employee.full_name,
        email: employee.email,
        phone: employee.phone || "",
        status: employee.status,
        position: employee.position || "",
        department: employee.department || "",
      })
    }
  }, [open, employee, form])

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Prepara os dados para atualização
      const updateData = {
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        status: values.status,
        position: values.position,
        department: values.department,
        updated_at: new Date().toISOString(),
      }

      // Atualiza o funcionário no banco de dados
      const { error } = await supabase.from("employees").update(updateData).eq("id", employee.id)

      if (error) {
        throw error
      }

      // Exibe mensagem de sucesso
      toast({
        title: "funcionário atualizado",
        description: "os dados do funcionário foram atualizados com sucesso.",
      })

      // Fecha o diálogo e atualiza a página
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "erro ao atualizar funcionário",
        description: error instanceof Error ? error.message : "ocorreu um erro ao atualizar o funcionário.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>editar funcionário</DialogTitle>
          <DialogDescription>atualize as informações do funcionário nos campos abaixo.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">dados básicos</TabsTrigger>
                <TabsTrigger value="professional">dados profissionais</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>e-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="joao.silva@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98765-4321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EmployeeStatus.ACTIVE}>ativo</SelectItem>
                          <SelectItem value={EmployeeStatus.VACATION}>em férias</SelectItem>
                          <SelectItem value={EmployeeStatus.TERMINATED}>desligado</SelectItem>
                          <SelectItem value={EmployeeStatus.MATERNITY_LEAVE}>licença maternidade</SelectItem>
                          <SelectItem value={EmployeeStatus.SICK_LEAVE}>licença saúde</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Analista de RH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Recursos Humanos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "salvando..." : "salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

