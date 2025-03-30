/**
 * Hook para gerenciar funcionários
 * Contém métodos para interagir com funcionários usando React Query
 */
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { employeeService } from "@/lib/services/employee-service"
import type { EmployeeStatus } from "@/lib/types/employees"
import type { EmployeeFormValues, EmployeeUpdateValues } from "@/lib/schemas/employee-schema"

/**
 * Hook para gerenciar funcionários
 * @returns Métodos e estados para gerenciar funcionários
 */
export function useEmployees() {
  const queryClient = useQueryClient()

  // Consultas
  const useEmployeesQuery = (companyId: string) =>
    useQuery({
      queryKey: ["employees", companyId],
      queryFn: () => employeeService.getEmployees(companyId),
    })

  const useEmployeeQuery = (employeeId: string) =>
    useQuery({
      queryKey: ["employee", employeeId],
      queryFn: () => employeeService.getEmployee(employeeId),
      enabled: !!employeeId,
    })
    
  const useDepartmentsQuery = (companyId: string) =>
    useQuery({
      queryKey: ["departments", companyId],
      queryFn: () => employeeService.getDepartments(companyId),
      enabled: !!companyId,
    })

  // Mutações
  const useCreateEmployeeMutation = () =>
    useMutation({
      mutationFn: (values: EmployeeFormValues) => 
        employeeService.createEmployee(values),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["employees"] })
        toast.success("Funcionário criado com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao criar funcionário: ${error.message}`)
      },
    })

  const useUpdateEmployeeMutation = () =>
    useMutation({
      mutationFn: ({ employeeId, data }: { employeeId: string; data: EmployeeUpdateValues }) =>
        employeeService.updateEmployee(employeeId, data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["employees"] })
        queryClient.invalidateQueries({ queryKey: ["employee", data.id] })
        toast.success("Funcionário atualizado com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar funcionário: ${error.message}`)
      },
    })

  const useUpdateEmployeeStatusMutation = () =>
    useMutation({
      mutationFn: ({ employeeId, status }: { employeeId: string; status: EmployeeStatus }) =>
        employeeService.updateEmployeeStatus(employeeId, status),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["employees"] })
        queryClient.invalidateQueries({ queryKey: ["employee", data.id] })
        toast.success(`Status do funcionário alterado para ${translateStatus(data.status)}!`)
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar status do funcionário: ${error.message}`)
      },
    })

  const useDeleteEmployeeMutation = () =>
    useMutation({
      mutationFn: (employeeId: string) => employeeService.deleteEmployee(employeeId),
      onSuccess: (_, employeeId) => {
        queryClient.invalidateQueries({ queryKey: ["employees"] })
        queryClient.removeQueries({ queryKey: ["employee", employeeId] })
        toast.success("Funcionário excluído com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao excluir funcionário: ${error.message}`)
      },
    })

  /**
   * Traduz o status do funcionário para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: "Ativo",
      inactive: "Inativo",
      on_leave: "Afastado",
      terminated: "Desligado",
    }
    
    return statusMap[status] || status
  }

  /**
   * Traduz o tipo de contrato para português
   * @param contractType Tipo de contrato
   * @returns Tipo traduzido
   */
  const translateContractType = (contractType: string): string => {
    const contractTypeMap: Record<string, string> = {
      clt: "CLT",
      pj: "PJ",
      intern: "Estagiário",
      freelancer: "Freelancer",
      temporary: "Temporário",
    }
    
    return contractTypeMap[contractType] || contractType
  }

  return {
    // Consultas
    useEmployeesQuery,
    useEmployeeQuery,
    useDepartmentsQuery,
    
    // Mutações
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useUpdateEmployeeStatusMutation,
    useDeleteEmployeeMutation,
    
    // Utilitários
    translateStatus,
    translateContractType,
  }
}

