"use client"

/**
 * Hook para gerenciar endereços no cliente
 * Fornece funções para manipular países, estados, cidades e endereços
 */
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { 
  Country, 
  State, 
  City, 
  EmployeeAddressInsert,
  EmployeeAddressUpdate,
  EmployeeAddressWithRelations 
} from "@/lib/types/address"
import {
  getCountries,
  getStates,
  getCities,
  getEmployeeAddresses,
  createEmployeeAddress,
  updateEmployeeAddress,
  deleteEmployeeAddress
} from "@/server/actions/address-actions"

/**
 * Hook para gerenciar endereços
 * @returns Objeto com dados e funções para manipular endereços
 */
export function useAddress() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null)

  // Busca países
  const { 
    data: countries = [], 
    isLoading: isLoadingCountries,
    error: countriesError 
  } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await getCountries()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    }
  })

  // Busca estados com base no país selecionado
  const { 
    data: states = [], 
    isLoading: isLoadingStates,
    error: statesError
  } = useQuery<State[]>({
    queryKey: ["states", selectedCountryId],
    queryFn: async () => {
      if (!selectedCountryId) return []

      const response = await getStates(selectedCountryId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
    enabled: !!selectedCountryId
  })

  // Busca cidades com base no estado selecionado
  const { 
    data: cities = [], 
    isLoading: isLoadingCities,
    error: citiesError
  } = useQuery<City[]>({
    queryKey: ["cities", selectedStateId],
    queryFn: async () => {
      if (!selectedStateId) return []

      const response = await getCities(selectedStateId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
    enabled: !!selectedStateId
  })

  // Busca endereços de um funcionário
  const useEmployeeAddresses = (employeeId: string) => useQuery<EmployeeAddressWithRelations[]>({
    queryKey: ["employee_addresses", employeeId],
    queryFn: async () => {
      if (!employeeId) return []

      const response = await getEmployeeAddresses(employeeId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
    enabled: !!employeeId
  })

  // Criação de endereço
  const createAddress = useMutation({
    mutationFn: async (address: EmployeeAddressInsert) => {
      const response = await createEmployeeAddress(address)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      if (!data) return
      
      toast({
        title: "Endereço adicionado",
        description: "O endereço foi adicionado com sucesso."
      })

      queryClient.invalidateQueries({ queryKey: ["employee_addresses", variables.employee_id] })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar endereço",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o endereço."
      })
    }
  })

  // Atualização de endereço
  const updateAddress = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: EmployeeAddressUpdate }) => {
      const response = await updateEmployeeAddress(id, data)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (data) => {
      if (!data) return
      
      toast({
        title: "Endereço atualizado",
        description: "O endereço foi atualizado com sucesso."
      })

      queryClient.invalidateQueries({ queryKey: ["employee_addresses", data.employee_id] })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar endereço",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o endereço."
      })
    }
  })

  // Remoção de endereço
  const deleteAddress = useMutation({
    mutationFn: async ({ id, employeeId }: { id: string, employeeId: string }) => {
      const response = await deleteEmployeeAddress(id)
      if (response.error) {
        throw new Error(response.error)
      }
      return { id, employeeId }
    },
    onSuccess: ({ employeeId }) => {
      toast({
        title: "Endereço removido",
        description: "O endereço foi removido com sucesso."
      })

      queryClient.invalidateQueries({ queryKey: ["employee_addresses", employeeId] })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover endereço",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o endereço."
      })
    }
  })

  return {
    // Dados
    countries,
    states,
    cities,
    useEmployeeAddresses,
    
    // Estados
    selectedCountryId,
    selectedStateId,
    setSelectedCountryId,
    setSelectedStateId,
    
    // Status de carregamento
    isLoadingCountries,
    isLoadingStates,
    isLoadingCities,
    
    // Erros
    countriesError,
    statesError,
    citiesError,
    
    // Mutações
    createEmployeeAddress: createAddress,
    updateEmployeeAddress: updateAddress,
    deleteEmployeeAddress: deleteAddress,
    
    // Status das mutações
    isCreating: createAddress.isPending,
    isUpdating: updateAddress.isPending,
    isDeleting: deleteAddress.isPending
  }
} 