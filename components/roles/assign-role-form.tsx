/**
 * Componente de formulário para atribuir cargo a funcionário
 * Permite selecionar um funcionário e atribuir um cargo a ele
 */
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useRoles } from "@/hooks/use-roles"
import { useEmployees } from "@/hooks/use-employees"
import { roleEmployeeSchema } from "@/lib/schemas/role-schema"
import { cn } from "@/lib/utils"

interface AssignRoleFormProps {
  roleId?: string
  employeeId?: string
  onSuccess?: () => void
}

export function AssignRoleForm({ roleId, employeeId, onSuccess }: AssignRoleFormProps) {
  const { assignRoleToEmployee, isAssigningRole } = useRoles()
  const { useEmployeesQuery } = useEmployees()
  const { data: employees, isLoading: isLoadingEmployees } = useEmployeesQuery()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(employeeId || null)

  const form = useForm({
    resolver: zodResolver(roleEmployeeSchema),
    defaultValues: {
      role_id: roleId || "",
      employee_id: employeeId || "",
      start_date: new Date().toISOString(),
      is_current: true,
    },
  })

  useEffect(() => {
    if (roleId) {
      form.setValue("role_id", roleId)
    }
    if (employeeId) {
      form.setValue("employee_id", employeeId)
      setSelectedEmployeeId(employeeId)
    }
  }, [roleId, employeeId, form])

  const onSubmit = (data: any) => {
    assignRoleToEmployee({
      ...data,
      start_date: new Date(data.start_date).toISOString(),
    })

    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!employeeId && (
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funcionário</FormLabel>
                <Select
                  disabled={isLoadingEmployees}
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedEmployeeId(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um funcionário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
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
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Início</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
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
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString() || "")}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_current"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Cargo Atual</FormLabel>
                <FormDescription>
                  Marque esta opção se este for o cargo atual do funcionário. Isso desativará automaticamente outros
                  cargos ativos.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isAssigningRole}>
          {isAssigningRole ? "Atribuindo..." : "Atribuir Cargo"}
        </Button>
      </form>
    </Form>
  )
}

