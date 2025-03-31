"use client"

/**
 * Componente de formulário para dependentes
 * Fornece formulário para cadastro e edição de dependentes
 */
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { FormattedInput } from "@/components/ui/formatted-input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { 
  EmployeeDependent, 
  DependentGender, 
  DependentRelationship 
} from "@/lib/types/documents"
import { 
  dependentFormSchema, 
  DependentFormValues 
} from "@/lib/schemas/dependent-schema"

/**
 * Props para o componente DependentForm
 */
interface DependentFormProps {
  employeeId: string
  initialData?: EmployeeDependent
  onSubmit: (values: DependentFormValues & { employee_id?: string }) => void
  isSubmitting?: boolean
}

/**
 * Formulário para adicionar e editar dependentes
 * @param employeeId ID do funcionário
 * @param initialData Dados iniciais do dependente (para edição)
 * @param onSubmit Função chamada ao enviar o formulário
 * @param isSubmitting Se o formulário está sendo enviado
 * @returns Componente de formulário de dependente
 */
export function DependentForm({
  employeeId,
  initialData,
  onSubmit,
  isSubmitting = false,
}: DependentFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData?.birth_date ? new Date(initialData.birth_date) : undefined
  )

  // Configuração do formulário
  const form = useForm<DependentFormValues>({
    resolver: zodResolver(dependentFormSchema),
    defaultValues: initialData ? {
      full_name: initialData.full_name,
      cpf: initialData.cpf || undefined,
      birth_date: initialData.birth_date,
      relationship: initialData.relationship,
      gender: initialData.gender,
      birth_certificate_number: initialData.birth_certificate_number || undefined,
      has_disability: initialData.has_disability,
      is_student: initialData.is_student,
      notes: initialData.notes || undefined,
    } : {
      full_name: "",
      cpf: "",
      birth_date: "",
      relationship: DependentRelationship.CHILD,
      gender: DependentGender.MALE,
      birth_certificate_number: "",
      has_disability: false,
      is_student: false,
      notes: "",
    },
  })

  /**
   * Função chamada ao enviar o formulário
   * @param values Valores do formulário
   */
  const handleSubmit = (values: DependentFormValues) => {
    onSubmit({
      ...values,
      employee_id: employeeId,
      birth_date: date?.toISOString() || new Date().toISOString(),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do dependente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <FormattedInput 
                      formatter="cpf" 
                      placeholder="123.456.789-00" 
                      {...field}
                      onValueChange={(raw) => {
                        form.setValue("cpf", raw, { shouldValidate: true });
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional para menores de idade
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          {date ? (
                            format(date, "PPP", { locale: pt })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate)
                          form.setValue(
                            "birth_date",
                            newDate?.toISOString() || "",
                            { shouldValidate: true }
                          )
                        }}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Relação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de relação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DependentRelationship.CHILD}>Filho(a)</SelectItem>
                      <SelectItem value={DependentRelationship.STEPCHILD}>Enteado(a)</SelectItem>
                      <SelectItem value={DependentRelationship.FOSTER_CHILD}>Filho(a) adotivo(a)</SelectItem>
                      <SelectItem value={DependentRelationship.LEGAL_WARD}>Tutelado(a)</SelectItem>
                      <SelectItem value={DependentRelationship.OTHER}>Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DependentGender.MALE}>Masculino</SelectItem>
                      <SelectItem value={DependentGender.FEMALE}>Feminino</SelectItem>
                      <SelectItem value={DependentGender.OTHER}>Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="birth_certificate_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certidão de Nascimento</FormLabel>
                <FormControl>
                  <Input placeholder="Número da certidão" {...field} />
                </FormControl>
                <FormDescription>
                  Número da certidão de nascimento ou RG
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="has_disability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Possui Deficiência</FormLabel>
                    <FormDescription>
                      Marque se o dependente possui deficiência
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_student"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>É Estudante</FormLabel>
                    <FormDescription>
                      Marque se o dependente é estudante (para IR)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais sobre o dependente"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Adicionar"} Dependente
        </Button>
      </form>
    </Form>
  )
} 