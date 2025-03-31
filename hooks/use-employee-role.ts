import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { EmployeeRoleService } from "@/lib/services/employee-role-service"
import { CreateEmployeeRoleInput, UpdateEmployeeRoleInput } from "@/lib/types/employee-role"
import { useToast } from "@/components/ui/use-toast"

const employeeRoleService = new EmployeeRoleService()

export function useEmployeeRoles(employeeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: roles, isLoading } = useQuery({
    queryKey: ["employee-roles", employeeId],
    queryFn: () => employeeRoleService.list(employeeId),
  })

  const { data: currentRole } = useQuery({
    queryKey: ["employee-current-role", employeeId],
    queryFn: () => employeeRoleService.getCurrentRole(employeeId),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateEmployeeRoleInput) => employeeRoleService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-roles", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["employee-current-role", employeeId] })
      toast({
        title: "Movimentação registrada",
        description: "A movimentação de cargo foi registrada com sucesso.",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar movimentação",
        description: "Ocorreu um erro ao registrar a movimentação de cargo.",
        variant: "destructive",
      })
      console.error("Erro ao criar movimentação:", error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeRoleInput }) =>
      employeeRoleService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-roles", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["employee-current-role", employeeId] })
      toast({
        title: "Movimentação atualizada",
        description: "A movimentação de cargo foi atualizada com sucesso.",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar movimentação",
        description: "Ocorreu um erro ao atualizar a movimentação de cargo.",
        variant: "destructive",
      })
      console.error("Erro ao atualizar movimentação:", error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeRoleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-roles", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["employee-current-role", employeeId] })
      toast({
        title: "Movimentação excluída",
        description: "A movimentação de cargo foi excluída com sucesso.",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir movimentação",
        description: "Ocorreu um erro ao excluir a movimentação de cargo.",
        variant: "destructive",
      })
      console.error("Erro ao excluir movimentação:", error)
    },
  })

  return {
    roles,
    currentRole,
    isLoading,
    createRole: createMutation.mutate,
    updateRole: updateMutation.mutate,
    deleteRole: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
} 