"use client"

/**
 * Hook para gerenciar dependentes no cliente
 * Fornece funções para listar, criar, atualizar e excluir dependentes usando React Query
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  EmployeeDependent, 
  EmployeeDependentInsert, 
  EmployeeDependentUpdate 
} from "@/lib/types/documents"
import { dependentService } from "@/lib/services/dependent-service"
import { toast } from "@/components/ui/use-toast"
import { DependentGender, DependentRelationship } from "@/lib/types/documents"

/**
 * Hook para gerenciar dependentes
 * @param employeeId ID do funcionário
 * @returns Funções e dados para gerenciar dependentes
 */
export function useDependents(employeeId: string) {
  const queryClient = useQueryClient()
  
  // Query para buscar todos os dependentes
  const dependentsQuery = useQuery({
    queryKey: ["dependents", employeeId],
    queryFn: () => dependentService.getDependents(employeeId),
    enabled: !!employeeId
  })
  
  // Mutation para criar dependente
  const createDependentMutation = useMutation({
    mutationFn: (dependent: EmployeeDependentInsert) => 
      dependentService.createDependent({
        ...dependent,
        employee_id: employeeId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
      toast({
        title: "Dependente adicionado",
        description: "O dependente foi adicionado com sucesso."
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar dependente",
        description: error.message
      })
    }
  })
  
  // Mutation para criar vários dependentes
  const createDependentsBatchMutation = useMutation({
    mutationFn: (dependents: Omit<EmployeeDependentInsert, 'employee_id'>[]) => 
      dependentService.createDependentsBatch(
        dependents.map(dependent => ({
          ...dependent,
          employee_id: employeeId
        }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
      toast({
        title: "Dependentes adicionados",
        description: "Os dependentes foram adicionados com sucesso."
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar dependentes",
        description: error.message
      })
    }
  })
  
  // Mutation para atualizar dependente
  const updateDependentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeDependentUpdate }) => 
      dependentService.updateDependent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
      toast({
        title: "Dependente atualizado",
        description: "O dependente foi atualizado com sucesso."
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar dependente",
        description: error.message
      })
    }
  })
  
  // Mutation para excluir dependente
  const deleteDependentMutation = useMutation({
    mutationFn: (id: string) => dependentService.deleteDependent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependents", employeeId] })
      toast({
        title: "Dependente removido",
        description: "O dependente foi removido com sucesso."
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover dependente",
        description: error.message
      })
    }
  })

  /**
   * Traduz o tipo de relação para exibição
   * @param relationship Tipo de relação em inglês
   * @returns Tipo de relação traduzido
   */
  const translateRelationship = (relationship: DependentRelationship): string => {
    const translations: Record<DependentRelationship, string> = {
      [DependentRelationship.CHILD]: "Filho(a)",
      [DependentRelationship.STEPCHILD]: "Enteado(a)",
      [DependentRelationship.FOSTER_CHILD]: "Filho(a) adotivo(a)",
      [DependentRelationship.LEGAL_WARD]: "Tutelado(a)",
      [DependentRelationship.OTHER]: "Outro"
    }
    
    return translations[relationship] || relationship
  }

  /**
   * Traduz o gênero para exibição
   * @param gender Gênero em inglês
   * @returns Gênero traduzido
   */
  const translateGender = (gender: DependentGender): string => {
    const translations: Record<DependentGender, string> = {
      [DependentGender.MALE]: "Masculino",
      [DependentGender.FEMALE]: "Feminino",
      [DependentGender.OTHER]: "Outro"
    }
    
    return translations[gender] || gender
  }
  
  return {
    dependents: dependentsQuery.data || [],
    isLoading: dependentsQuery.isLoading,
    createDependent: (dependent: Omit<EmployeeDependentInsert, 'employee_id'>) => 
      createDependentMutation.mutate({
        ...dependent,
        employee_id: employeeId
      }),
    createDependentsBatch: (dependents: Omit<EmployeeDependentInsert, 'employee_id'>[]) => 
      createDependentsBatchMutation.mutate(dependents),
    updateDependent: (id: string, data: EmployeeDependentUpdate) => 
      updateDependentMutation.mutate({ id, data }),
    deleteDependent: (id: string) => 
      deleteDependentMutation.mutate(id),
    isCreating: createDependentMutation.isPending || createDependentsBatchMutation.isPending,
    isUpdating: updateDependentMutation.isPending,
    isDeleting: deleteDependentMutation.isPending,
    translateRelationship,
    translateGender,
    // Opções para selects
    relationshipOptions: Object.values(DependentRelationship).map(value => ({
      value,
      label: translateRelationship(value)
    })),
    genderOptions: Object.values(DependentGender).map(value => ({
      value,
      label: translateGender(value)
    }))
  }
} 