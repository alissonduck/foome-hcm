"use server"

/**
 * Server Actions para operações relacionadas a endereços
 * Fornece funções para manipular países, estados, cidades e endereços de funcionários
 */
import { revalidatePath } from "next/cache"
import { AddressService } from "@/lib/services/address-service"
import { 
  Country, 
  State, 
  City, 
  EmployeeAddressInsert,
  EmployeeAddressUpdate,
  EmployeeAddressWithRelations
} from "@/lib/types/address"
import { isAuthenticated } from "@/lib/auth-utils-server"
import { createClient } from "@/lib/supabase/server"

const addressService = new AddressService()

/**
 * Busca todos os países disponíveis
 * @returns Lista de países
 */
export async function getCountries(): Promise<{ data: Country[] | null; error: string | null }> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { data: null, error: "Usuário não autenticado" }
    }

    const countries = await addressService.listCountries()
    return { data: countries, error: null }
  } catch (error) {
    console.error("Erro ao buscar países:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Erro ao buscar países" 
    }
  }
}

/**
 * Busca todos os estados de um país
 * @param countryId ID do país
 * @returns Lista de estados
 */
export async function getStates(countryId: string): Promise<{ data: State[] | null; error: string | null }> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { data: null, error: "Usuário não autenticado" }
    }

    if (!countryId) {
      return { data: null, error: "ID do país é obrigatório" }
    }
    
    const states = await addressService.listStates(countryId)
    return { data: states, error: null }
  } catch (error) {
    console.error("Erro ao buscar estados:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Erro ao buscar estados" 
    }
  }
}

/**
 * Busca todas as cidades de um estado
 * @param stateId ID do estado
 * @returns Lista de cidades
 */
export async function getCities(stateId: string): Promise<{ data: City[] | null; error: string | null }> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { data: null, error: "Usuário não autenticado" }
    }

    if (!stateId) {
      return { data: null, error: "ID do estado é obrigatório" }
    }
    
    const cities = await addressService.listCities(stateId)
    return { data: cities, error: null }
  } catch (error) {
    console.error("Erro ao buscar cidades:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Erro ao buscar cidades" 
    }
  }
}

/**
 * Busca os endereços de um funcionário
 * @param employeeId ID do funcionário
 * @returns Lista de endereços com relações
 */
export async function getEmployeeAddresses(employeeId: string): Promise<{ 
  data: EmployeeAddressWithRelations[] | null; 
  error: string | null 
}> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { data: null, error: "Usuário não autenticado" }
    }

    if (!employeeId) {
      return { data: null, error: "ID do funcionário é obrigatório" }
    }
    
    const addresses = await addressService.listEmployeeAddresses(employeeId)
    return { data: addresses, error: null }
  } catch (error) {
    console.error("Erro ao buscar endereços do funcionário:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Erro ao buscar endereços do funcionário" 
    }
  }
}

/**
 * Cria um novo endereço para um funcionário
 * @param data Dados do endereço
 * @returns Endereço criado com relações
 */
export async function createEmployeeAddress(data: EmployeeAddressInsert): Promise<{ 
  data: EmployeeAddressWithRelations | null; 
  error: string | null 
}> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { data: null, error: "Usuário não autenticado" }
    }

    // Validações básicas
    if (!data.employee_id) {
      return { data: null, error: "ID do funcionário é obrigatório" }
    }
    
    if (!data.street || !data.number || !data.neighborhood || !data.postal_code) {
      return { data: null, error: "Dados incompletos do endereço" }
    }
    
    if (!data.country_id || !data.state_id || !data.city_id) {
      return { data: null, error: "País, estado e cidade são obrigatórios" }
    }
    
    // Criar endereço
    const address = await addressService.createEmployeeAddress(data)
    
    // Revalidar cache
    revalidatePath(`/dashboard/employees/${data.employee_id}`)
    
    return { data: address, error: null }
  } catch (error) {
    console.error("Erro ao criar endereço:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Erro ao criar endereço" 
    }
  }
}

/**
 * Atualiza um endereço existente
 * @param id ID do endereço
 * @param data Dados a serem atualizados
 * @returns Endereço atualizado com relações
 */
export async function updateEmployeeAddress(id: string, data: EmployeeAddressUpdate): Promise<{ 
  data: EmployeeAddressWithRelations | null; 
  error: string | null 
}> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { data: null, error: "Usuário não autenticado" }
    }

    if (!id) {
      return { data: null, error: "ID do endereço é obrigatório" }
    }
    
    // Buscar endereço para obter o employee_id para revalidação
    const existingAddress = await addressService.getEmployeeAddress(id)
    if (!existingAddress) {
      return { data: null, error: "Endereço não encontrado" }
    }
    
    // Atualizar endereço
    const address = await addressService.updateEmployeeAddress(id, data)
    
    // Revalidar cache
    revalidatePath(`/dashboard/employees/${existingAddress.employee_id}`)
    
    return { data: address, error: null }
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Erro ao atualizar endereço" 
    }
  }
}

/**
 * Remove um endereço
 * @param id ID do endereço
 * @returns Sucesso ou erro
 */
export async function deleteEmployeeAddress(id: string): Promise<{ 
  success: boolean; 
  error: string | null 
}> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return { success: false, error: "Usuário não autenticado" }
    }

    if (!id) {
      return { success: false, error: "ID do endereço é obrigatório" }
    }
    
    // Buscar endereço para obter o employee_id para revalidação
    const existingAddress = await addressService.getEmployeeAddress(id)
    if (!existingAddress) {
      return { success: false, error: "Endereço não encontrado" }
    }
    
    // Deletar endereço
    await addressService.deleteEmployeeAddress(id)
    
    // Revalidar cache
    revalidatePath(`/dashboard/employees/${existingAddress.employee_id}`)
    
    return { success: true, error: null }
  } catch (error) {
    console.error("Erro ao remover endereço:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro ao remover endereço" 
    }
  }
} 