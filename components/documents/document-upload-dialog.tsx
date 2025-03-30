"use client"

/**
 * Diálogo para upload de documentos
 */
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { FileUp } from "lucide-react"
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
import { useDocuments } from "@/hooks/use-documents"
import { documentUploadSchema, DOCUMENT_TYPES } from "@/lib/schemas/document-schema"
import type { DocumentUploadFormValues } from "@/lib/schemas/document-schema"
import { z } from "zod"

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
  const router = useRouter()
  const { useUploadDocumentMutation } = useDocuments()
  const uploadMutation = useUploadDocumentMutation()

  // Configuração do formulário
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
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
  async function onSubmit(values: DocumentUploadFormValues) {
    await uploadMutation.mutateAsync({
      ...values,
      employeeId: values.employeeId || currentEmployeeId,
    })
    
    // Fecha o diálogo e atualiza a página
    onOpenChange(false)
    form.reset()
    router.refresh()
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
                      {DOCUMENT_TYPES.map((type) => (
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
                  <FormLabel>Data de Validade</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Data de validade do documento (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      {...field}
                      onChange={(e) => onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG (máximo 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Enviando..." : (
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

