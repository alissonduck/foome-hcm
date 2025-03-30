/**
 * Hook para gerenciar funcionários usando React Query
 * Fornece métodos para buscar, criar, atualizar e excluir funcionários
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import type { Employee } from "@/lib/types"

/**
 * Hook para gerenciar funcionários
 * @returns Métodos e estados para gerenciar funcionários
 */
export function useEmployees() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Busca todos os funcionários de uma empresa
   * @param companyId ID da empresa
   * @returns Query para funcionários
   */
  const useEmployeesQuery = (companyId: string) => {
    return useQuery({
      queryKey: ["employees", companyId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })

        if (error) {
          toast({
            title: "Erro ao buscar funcionários",
            description: error.message,
            variant: "destructive",
          })
          throw error
        }

        return data as Employee[]
      },
      enabled: !!companyId,
    })
  }

  /**
   * Busca um funcionário específico
   * @param employeeId ID do funcionário
   * @returns Query para o funcionário
   */
  const useEmployeeQuery = (employeeId: string) => {
    return useQuery({
      queryKey: ["employee", employeeId],
      queryFn: async () => {
        const { data, error } = await supabase.from("employees").select("*").eq("id", employeeId).single()

        if (error) {
          toast({
            title: "Erro ao buscar funcionário",
            description: error.message,
            variant: "destructive",
          })
          throw error
        }

        return data as Employee
      },
      enabled: !!employeeId,
    })
  }

  /**
   * Cria um novo funcionário
   */
  const createEmployee = useMutation({
    mutationFn: async (employeeData: Partial<Employee>) => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("employees").insert(employeeData).select().single()

        if (error) {
          toast({
            title: "Erro ao criar funcionário",
            description: error.message,
            variant: "destructive",
          })
          throw error
        }

        toast({
          title: "Funcionário criado com sucesso",
          description: "O funcionário foi adicionado à sua empresa.",
        })

        return data
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", variables.company_id] })
      router.push(`/dashboard/employees/${data.id}`)
    },
  })

  /**
   * Atualiza um funcionário existente
   */
  const updateEmployee = useMutation({
    mutationFn: async ({
      employeeId,
      employeeData,
    }: {
      employeeId: string
      employeeData: Partial<Employee>
    }) => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", employeeId)
          .select()
          .single()

        if (error) {
          toast({
            title: "Erro ao atualizar funcionário",
            description: error.message,
            variant: "destructive",
          })
          throw error
        }

        toast({
          title: "Funcionário atualizado com sucesso",
          description: "As informações do funcionário foram atualizadas.",
        })

        return data
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      queryClient.invalidateQueries({ queryKey: ["employee", data.id] })
    },
  })

  /**
   * Exclui um funcionário
   */
  const deleteEmployee = useMutation({
    mutationFn: async ({
      employeeId,
      companyId,
    }: {
      employeeId: string
      companyId: string
    }) => {
      setIsLoading(true)
      try {
        const { error } = await supabase.from("employees").delete().eq("id", employeeId)

        if (error) {
          toast({
            title: "Erro ao excluir funcionário",
            description: error.message,
            variant: "destructive",
          })
          throw error
        }

        toast({
          title: "Funcionário excluído com sucesso",
          description: "O funcionário foi removido da sua empresa.",
        })

        return { employeeId, companyId }
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: ({ companyId }) => {
      queryClient.invalidateQueries({ queryKey: ["employees", companyId] })
      router.push("/dashboard/employees")
    },
  })

  return {
    useEmployeesQuery,
    useEmployeeQuery,
    createEmployee: createEmployee.mutate,
    updateEmployee: updateEmployee.mutate,
    deleteEmployee: deleteEmployee.mutate,
    isCreatingEmployee: createEmployee.isPending,
    isUpdatingEmployee: updateEmployee.isPending,
    isDeletingEmployee: deleteEmployee.isPending,
    isLoading,
  }
}

