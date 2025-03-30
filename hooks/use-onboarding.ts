/**
 * Hook para gerenciamento de onboarding usando React Query
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { OnboardingFilters, OnboardingTaskInsert, OnboardingTaskUpdate } from "@/lib/types/onboarding"

/**
 * Hook para gerenciamento de onboarding
 * @returns Funções e dados para gerenciamento de onboarding
 */
export function useOnboarding() {
  const queryClient = useQueryClient()

  /**
   * Traduz o status do onboarding para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  function translateStatus(status: string) {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      completed: "Concluído",
    }
    return statusMap[status] || status
  }

  /**
   * Traduz a categoria da tarefa para português
   * @param category Categoria em inglês
   * @returns Categoria traduzida
   */
  function translateCategory(category: string) {
    const categoryMap: Record<string, string> = {
      documentation: "Documentação",
      training: "Treinamento",
      system_access: "Acesso a Sistemas",
      equipment: "Equipamentos",
      introduction: "Introdução",
      other: "Outro",
    }
    return categoryMap[category] || category
  }

  // Consultas

  /**
   * Consulta para obter tarefas de onboarding
   * @param companyId ID da empresa
   * @returns Query com tarefas de onboarding
   */
  function useTasksQuery(companyId: string) {
    return useQuery({
      queryKey: ["onboarding-tasks", companyId],
      queryFn: async () => {
        const response = await fetch(`/api/onboarding/tasks?companyId=${companyId}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao buscar tarefas de onboarding")
        }
        return response.json()
      },
      enabled: !!companyId,
    })
  }

  /**
   * Consulta para obter uma tarefa específica
   * @param taskId ID da tarefa
   * @returns Query com os dados da tarefa
   */
  function useTaskQuery(taskId: string) {
    return useQuery({
      queryKey: ["onboarding-task", taskId],
      queryFn: async () => {
        const response = await fetch(`/api/onboarding/tasks/${taskId}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao buscar tarefa de onboarding")
        }
        return response.json()
      },
      enabled: !!taskId,
    })
  }

  /**
   * Consulta para obter onboardings
   * @param companyId ID da empresa
   * @param isAdmin Indica se o usuário é administrador
   * @param employeeId ID do funcionário (obrigatório se não for admin)
   * @param filters Filtros opcionais
   * @returns Query com lista de onboardings
   */
  function useOnboardingsQuery(
    companyId: string,
    isAdmin: boolean,
    employeeId?: string,
    filters?: OnboardingFilters
  ) {
    return useQuery({
      queryKey: ["onboardings", companyId, isAdmin, employeeId, filters],
      queryFn: async () => {
        // Constrói a URL com os parâmetros
        let url = `/api/onboarding?companyId=${companyId}&isAdmin=${isAdmin}`
        
        if (employeeId) {
          url += `&employeeId=${employeeId}`
        }
        
        if (filters) {
          if (filters.status) {
            url += `&status=${filters.status}`
          }
          if (filters.employeeId) {
            url += `&filterEmployeeId=${filters.employeeId}`
          }
          if (filters.search) {
            url += `&search=${encodeURIComponent(filters.search)}`
          }
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao buscar onboardings")
        }
        return response.json()
      },
      enabled: !!companyId && (isAdmin || !!employeeId),
    })
  }

  /**
   * Consulta para obter um onboarding específico
   * @param onboardingId ID do onboarding
   * @returns Query com os dados do onboarding
   */
  function useOnboardingQuery(onboardingId: string) {
    return useQuery({
      queryKey: ["onboarding", onboardingId],
      queryFn: async () => {
        const response = await fetch(`/api/onboarding/${onboardingId}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao buscar detalhes do onboarding")
        }
        return response.json()
      },
      enabled: !!onboardingId,
    })
  }

  // Mutações

  /**
   * Mutação para criar uma tarefa de onboarding
   * @returns Mutation para criar tarefa
   */
  function useCreateTaskMutation() {
    return useMutation({
      mutationFn: async (task: OnboardingTaskInsert) => {
        const response = await fetch("/api/onboarding/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao criar tarefa de onboarding")
        }
        
        return response.json()
      },
      onSuccess: (data, variables) => {
        toast.success("Tarefa criada com sucesso")
        // Invalida a consulta para forçar a atualização
        queryClient.invalidateQueries({ queryKey: ["onboarding-tasks", variables.company_id] })
      },
      onError: (error) => {
        toast.error(`Erro ao criar tarefa: ${error.message}`)
      },
    })
  }

  /**
   * Mutação para atualizar uma tarefa de onboarding
   * @returns Mutation para atualizar tarefa
   */
  function useUpdateTaskMutation() {
    return useMutation({
      mutationFn: async ({ taskId, task }: { taskId: string; task: OnboardingTaskUpdate }) => {
        const response = await fetch(`/api/onboarding/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao atualizar tarefa de onboarding")
        }
        
        return response.json()
      },
      onSuccess: (data) => {
        toast.success("Tarefa atualizada com sucesso")
        // Invalida as consultas para forçar a atualização
        queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] })
        queryClient.invalidateQueries({ queryKey: ["onboarding-task", data.id] })
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar tarefa: ${error.message}`)
      },
    })
  }

  /**
   * Mutação para excluir uma tarefa de onboarding
   * @returns Mutation para excluir tarefa
   */
  function useDeleteTaskMutation() {
    return useMutation({
      mutationFn: async (taskId: string) => {
        const response = await fetch(`/api/onboarding/tasks/${taskId}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao excluir tarefa de onboarding")
        }
        
        return response.json()
      },
      onSuccess: () => {
        toast.success("Tarefa excluída com sucesso")
        // Invalida a consulta para forçar a atualização
        queryClient.invalidateQueries({ queryKey: ["onboarding-tasks"] })
      },
      onError: (error) => {
        toast.error(`Erro ao excluir tarefa: ${error.message}`)
      },
    })
  }

  /**
   * Mutação para atribuir tarefas a um funcionário
   * @returns Mutation para atribuir tarefas
   */
  function useAssignTasksMutation() {
    return useMutation({
      mutationFn: async (data: {
        employeeId: string;
        taskIds: string[];
        notes?: string;
        dueDate?: string;
      }) => {
        const response = await fetch("/api/onboarding/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao atribuir tarefas")
        }
        
        return response.json()
      },
      onSuccess: () => {
        toast.success("Tarefas atribuídas com sucesso")
        // Invalida a consulta para forçar a atualização
        queryClient.invalidateQueries({ queryKey: ["onboardings"] })
      },
      onError: (error) => {
        toast.error(`Erro ao atribuir tarefas: ${error.message}`)
      },
    })
  }

  /**
   * Mutação para atualizar o status de um onboarding
   * @returns Mutation para atualizar status
   */
  function useUpdateStatusMutation() {
    return useMutation({
      mutationFn: async (data: {
        onboardingId: string;
        status: string;
        completedBy?: string;
        notes?: string;
      }) => {
        const response = await fetch(`/api/onboarding/${data.onboardingId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: data.status,
            completed_by: data.completedBy,
            notes: data.notes,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao atualizar status")
        }
        
        return response.json()
      },
      onSuccess: (data) => {
        toast.success(`Tarefa marcada como ${translateStatus(data.status).toLowerCase()}`)
        // Invalida as consultas para forçar a atualização
        queryClient.invalidateQueries({ queryKey: ["onboardings"] })
        queryClient.invalidateQueries({ queryKey: ["onboarding", data.id] })
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar status: ${error.message}`)
      },
    })
  }

  /**
   * Mutação para excluir um onboarding
   * @returns Mutation para excluir onboarding
   */
  function useDeleteOnboardingMutation() {
    return useMutation({
      mutationFn: async (onboardingId: string) => {
        const response = await fetch(`/api/onboarding/${onboardingId}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Erro ao excluir onboarding")
        }
        
        return response.json()
      },
      onSuccess: () => {
        toast.success("Tarefa de onboarding removida com sucesso")
        // Invalida a consulta para forçar a atualização
        queryClient.invalidateQueries({ queryKey: ["onboardings"] })
      },
      onError: (error) => {
        toast.error(`Erro ao excluir onboarding: ${error.message}`)
      },
    })
  }

  return {
    // Utilities
    translateStatus,
    translateCategory,
    
    // Queries
    useTasksQuery,
    useTaskQuery,
    useOnboardingsQuery,
    useOnboardingQuery,
    
    // Mutations
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useAssignTasksMutation,
    useUpdateStatusMutation,
    useDeleteOnboardingMutation,
  }
} 