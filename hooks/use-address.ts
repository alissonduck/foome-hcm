"use client"

/**
 * Hook para gerenciar endereços no cliente
 * Fornece funções para manipular países, estados, cidades e endereços
 */
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { 
  Country, 
  State, 
  City, 
  EmployeeAddressInsert,
  EmployeeAddressUpdate,
  EmployeeAddressWithRelations 
} from "@/lib/types/address"

/**
 * Hook para gerenciar endereços
 * @returns Objeto com dados e funções para manipular endereços
 */
export function useAddress() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const supabase = createClient()
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
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name")

      if (error) throw error
      return data || []
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

      const { data, error } = await supabase
        .from("states")
        .select("*")
        .eq("country_id", selectedCountryId)
        .order("name")

      if (error) throw error
      return data || []
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

      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("state_id", selectedStateId)
        .order("name")

      if (error) throw error
      return data || []
    },
    enabled: !!selectedStateId
  })

  // Busca endereços de um funcionário
  const useEmployeeAddresses = (employeeId: string) => useQuery<EmployeeAddressWithRelations[]>({
    queryKey: ["employee_addresses", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_addresses")
        .select(`
          *,
          country:countries(*),
          state:states(*),
          city:cities(*)
        `)
        .eq("employee_id", employeeId)

      if (error) throw error
      return data || []
    },
    enabled: !!employeeId
  })

  // Criação de endereço
  const createEmployeeAddress = useMutation({
    mutationFn: async (address: EmployeeAddressInsert) => {
      const { data, error } = await supabase
        .from("employee_addresses")
        .insert([address])
        .select(`
          *,
          country:countries(*),
          state:states(*),
          city:cities(*)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
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
  const updateEmployeeAddress = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: EmployeeAddressUpdate }) => {
      const { data: updatedData, error } = await supabase
        .from("employee_addresses")
        .update(data)
        .eq("id", id)
        .select(`
          *,
          country:countries(*),
          state:states(*),
          city:cities(*)
        `)
        .single()

      if (error) throw error
      return updatedData
    },
    onSuccess: (data) => {
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
  const deleteEmployeeAddress = useMutation({
    mutationFn: async ({ id, employeeId }: { id: string, employeeId: string }) => {
      const { error } = await supabase
        .from("employee_addresses")
        .delete()
        .eq("id", id)

      if (error) throw error
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
    createEmployeeAddress,
    updateEmployeeAddress,
    deleteEmployeeAddress,
    
    // Status das mutações
    isCreating: createEmployeeAddress.isPending,
    isUpdating: updateEmployeeAddress.isPending,
    isDeleting: deleteEmployeeAddress.isPending
  }
} 