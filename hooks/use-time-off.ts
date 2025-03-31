/**
 * Hook para gerenciamento de férias e ausências (time-off)
 * Utiliza React Query para gerenciar as requisições
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { 
  TimeOffStatus, 
  TimeOffType, 
  TimeOffCreateData, 
  TimeOffStatusUpdateData 
} from "@/lib/types/time-off"

/**
 * Hook para gerenciamento de férias e ausências
 * @returns Funções e utilitários para gerenciar férias e ausências
 */
export function useTimeOff() {
  const queryClient = useQueryClient()

  // Função para traduzir o status da solicitação para português
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "pendente",
      approved: "aprovado",
      rejected: "rejeitado",
    }

    return statusMap[status] || status
  }

  // Função para traduzir o tipo da solicitação para português
  const translateType = (type: string): string => {
    const typeMap: Record<string, string> = {
      vacation: "férias",
      sick_leave: "licença médica",
      maternity_leave: "licença maternidade",
      paternity_leave: "licença paternidade",
      bereavement: "licença luto",
      personal: "licença pessoal",
      other: "outro",
    }

    return typeMap[type] || type
  }

  // Obtém a cor do badge com base no status
  const getStatusBadgeVariant = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Obtém a cor do badge com base no tipo
  const getTypeBadgeVariant = (type: string): string => {
    switch (type) {
      case "vacation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "sick_leave":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "maternity_leave":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
      case "paternity_leave":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
      case "bereavement":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      case "personal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Calcula o número de dias entre duas datas
  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Inclui o dia de início e término
  }

  /**
   * Query para obter todas as solicitações
   * @param employeeId ID do funcionário (opcional)
   * @returns Query para as solicitações
   */
  const useTimeOffsQuery = (employeeId?: string | null) => {
    return useQuery({
      queryKey: ["timeOffs", employeeId],
      queryFn: async () => {
        const response = await fetch(
          `/api/time-off${employeeId ? `?employeeId=${employeeId}` : ""}`
        )
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao buscar solicitações")
        }
        
        return response.json()
      }
    })
  }

  /**
   * Query para obter uma solicitação específica
   * @param timeOffId ID da solicitação
   * @returns Query para a solicitação
   */
  const useTimeOffQuery = (timeOffId: string) => {
    return useQuery({
      queryKey: ["timeOff", timeOffId],
      queryFn: async () => {
        const response = await fetch(`/api/time-off/${timeOffId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao buscar solicitação")
        }
        
        return response.json()
      },
      enabled: !!timeOffId
    })
  }

  /**
   * Mutation para criar uma nova solicitação
   * @returns Mutation para criar solicitação
   */
  const useCreateTimeOffMutation = () => {
    return useMutation({
      mutationFn: async (data: TimeOffCreateData) => {
        const response = await fetch("/api/time-off", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: data.employeeId,
            type: data.type,
            start_date: data.startDate,
            end_date: data.endDate,
            reason: data.reason,
            total_days: calculateDays(data.startDate, data.endDate)
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao criar solicitação")
        }

        return response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timeOffs"] })
        toast({
          title: "Solicitação enviada",
          description: "A solicitação foi enviada com sucesso.",
        })
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao enviar solicitação",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar a solicitação.",
        })
      },
    })
  }

  /**
   * Mutation para atualizar o status de uma solicitação
   * @returns Mutation para atualizar status
   */
  const useUpdateTimeOffStatusMutation = () => {
    return useMutation({
      mutationFn: async (data: TimeOffStatusUpdateData) => {
        const response = await fetch(`/api/time-off/${data.timeOffId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: data.status
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao atualizar status")
        }

        return response.json()
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["timeOffs"] })
        queryClient.invalidateQueries({ queryKey: ["timeOff", variables.timeOffId] })
        
        const statusText = variables.status === "approved" ? "aprovada" : "rejeitada"
        toast({
          title: `Solicitação ${statusText}`,
          description: `A solicitação foi ${statusText} com sucesso.`,
        })
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o status.",
        })
      },
    })
  }

  /**
   * Mutation para excluir uma solicitação
   * @returns Mutation para excluir solicitação
   */
  const useDeleteTimeOffMutation = () => {
    return useMutation({
      mutationFn: async (timeOffId: string) => {
        const response = await fetch(`/api/time-off/${timeOffId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao excluir solicitação")
        }

        return response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["timeOffs"] })
        toast({
          title: "Solicitação excluída",
          description: "A solicitação foi excluída com sucesso.",
        })
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao excluir solicitação",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a solicitação.",
        })
      },
    })
  }

  return {
    // Queries
    useTimeOffsQuery,
    useTimeOffQuery,
    
    // Mutations
    useCreateTimeOffMutation,
    useUpdateTimeOffStatusMutation,
    useDeleteTimeOffMutation,
    
    // Utility functions
    translateStatus,
    translateType,
    getStatusBadgeVariant,
    getTypeBadgeVariant,
    calculateDays
  }
} 