"use client"

/**
 * Diálogo para upload de documentos
 */
import { useState } from "react"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FileUp } from "lucide-react"

/**
 * Props para o componente DocumentUploadDialog
 */
interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: any[]
  currentEmployeeId: string
  isAdmin: boolean
}

/**
 * Schema de validação para o formulário de upload de documento
 */
const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres.",
  }),
  type: z.string({
    required_error: "Selecione o tipo de documento.",
  }),
  employeeId: z.string({
    required_error: "Selecione o funcionário.",
  }),
  expirationDate: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "Selecione um arquivo para upload.",
  }),
})

/**
 * Tipos de documentos disponíveis
 */
const documentTypes = [
  { value: "rg", label: "RG" },
  { value: "cpf", label: "CPF" },
  { value: "ctps", label: "CTPS" },
  { value: "pis", label: "PIS/PASEP" },
  { value: "titulo_eleitor", label: "Título de Eleitor" },
  { value: "reservista", label: "Certificado de Reservista" },
  { value: "comprovante_residencia", label: "Comprovante de Residência" },
  { value: "diploma", label: "Diploma" },
  { value: "certificado", label: "Certificado" },
  { value: "carteira_vacinacao", label: "Carteira de Vacinação" },
  { value: "atestado_medico", label: "Atestado Médico" },
  { value: "contrato", label: "Contrato de Trabalho" },
  { value: "outros", label: "Outros" },
]

/**
 * Componente de diálogo para upload de documentos
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param isAdmin Indica se o usuário é administrador
 * @returns Diálogo para upload de documentos
 */
export default function DocumentUploadDialog({
  open,
  onOpenChange,
  employees,
  currentEmployeeId,
  isAdmin,
}: DocumentUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      employeeId: currentEmployeeId,
      expirationDate: "",
    },
  })

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsUploading(true)

      // Obtém o arquivo
      const file = values.file[0]

      // Gera um nome único para o arquivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${values.employeeId}/${fileName}`

      // Faz o upload do arquivo
      const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Cria o registro do documento
      const { error: insertError } = await supabase.from("employee_documents").insert({
        employee_id: values.employeeId,
        name: values.name,
        type: values.type,
        status: "pending",
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        expiration_date: values.expirationDate || null,
      })

      if (insertError) {
        throw insertError
      }

      // Exibe mensagem de sucesso
      toast({
        title: "Documento enviado com sucesso",
        description: "O documento foi enviado e está aguardando aprovação.",
      })

      // Fecha o diálogo e atualiza a página
      onOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao enviar documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar o documento.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
          <DialogDescription>Preencha os dados e faça o upload do documento.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: RG João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
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

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Validade (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Deixe em branco se o documento não tiver data de validade</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} />
                  </FormControl>
                  <FormDescription>Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Enviar Documento
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

