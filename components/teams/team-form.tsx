/**
 * Componente de formulário para criar ou editar equipe
 * Permite preencher os dados básicos de uma equipe
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useTeams } from "@/hooks/use-teams"

// Schema de validação para o formulário
const teamFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres" }),
  description: z
    .string()
    .max(500, { message: "A descrição deve ter no máximo 500 caracteres" })
    .nullable()
    .optional(),
  manager_id: z
    .union([z.string(), z.literal("none"), z.null()])
    .optional(),
  company_id: z.string(),
})

// Tipo derivado do schema
type TeamFormValues = z.infer<typeof teamFormSchema>

interface TeamFormProps {
  companyId: string
  employeeId: string
  initialData?: TeamFormValues & { id?: string }
  employees?: { id: string; full_name: string; position?: string }[]
  isEditing?: boolean
}

/**
 * Componente de formulário para equipes
 * @param props Propriedades do componente
 * @returns Componente de formulário
 */
export function TeamForm({ companyId, employeeId, initialData, employees = [], isEditing = false }: TeamFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createTeam, updateTeam } = useTeams()

  // Inicialização do formulário com React Hook Form e Zod
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: initialData 
      ? {
          ...initialData,
          manager_id: initialData.manager_id || "none"
        }
      : {
          name: "",
          description: "",
          manager_id: "none",
          company_id: companyId,
        },
  })

  // Função de submissão do formulário
  const onSubmit = async (data: TeamFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Converte "none" para null
      if (data.manager_id === "none") {
        data.manager_id = null;
      }

      if (isEditing && initialData?.id) {
        // Atualiza a equipe existente
        await updateTeam(initialData.id, data)
        toast.success("Equipe atualizada com sucesso!")
        router.refresh()
      } else {
        // Cria uma nova equipe com o created_by preenchido
        await createTeam({
          ...data,
          created_by: employeeId
        })
        toast.success("Equipe criada com sucesso!")
        router.push("/dashboard/teams")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao salvar a equipe")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Equipe</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Marketing" {...field} />
                </FormControl>
                <FormDescription>
                  Nome da equipe que será exibido em todos os relatórios
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manager_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gestor(a) da Equipe</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gestor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sem gestor definido</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} {employee.position ? `(${employee.position})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  O gestor será responsável por gerenciar a equipe
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a finalidade e principais responsabilidades da equipe"
                  className="min-h-[120px]"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Atualizar" : "Criar"} Equipe
          </Button>
        </div>
      </form>
    </Form>
  )
} 