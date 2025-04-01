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
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"

const addressService = new AddressService()

/**
 * Busca todos os países disponíveis
 * @returns Lista de países
 */
export async function getCountries(): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    const countries = await addressService.listCountries()
    return constructServerResponse({
      success: true,
      data: countries
    })
  } catch (error) {
    console.error("Erro ao buscar países:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar países"
    })
  }
}

/**
 * Busca todos os estados de um país
 * @param countryId ID do país
 * @returns Lista de estados
 */
export async function getStates(countryId: string): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    if (!countryId) {
      return constructServerResponse({
        success: false,
        error: "ID do país é obrigatório"
      })
    }
    
    const states = await addressService.listStates(countryId)
    return constructServerResponse({
      success: true,
      data: states
    })
  } catch (error) {
    console.error("Erro ao buscar estados:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar estados"
    })
  }
}

/**
 * Busca todas as cidades de um estado
 * @param stateId ID do estado
 * @returns Lista de cidades
 */
export async function getCities(stateId: string): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    if (!stateId) {
      return constructServerResponse({
        success: false,
        error: "ID do estado é obrigatório"
      })
    }
    
    const cities = await addressService.listCities(stateId)
    return constructServerResponse({
      success: true,
      data: cities
    })
  } catch (error) {
    console.error("Erro ao buscar cidades:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar cidades"
    })
  }
}

/**
 * Busca os endereços de um funcionário
 * @param employeeId ID do funcionário
 * @returns Lista de endereços com relações
 */
export async function getEmployeeAddresses(employeeId: string): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    if (!employeeId) {
      return constructServerResponse({
        success: false,
        error: "ID do funcionário é obrigatório"
      })
    }
    
    const addresses = await addressService.listEmployeeAddresses(employeeId)
    return constructServerResponse({
      success: true,
      data: addresses
    })
  } catch (error) {
    console.error("Erro ao buscar endereços do funcionário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar endereços do funcionário"
    })
  }
}

/**
 * Cria um novo endereço para um funcionário
 * @param data Dados do endereço
 * @returns Endereço criado com relações
 */
export async function createEmployeeAddress(data: EmployeeAddressInsert): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    // Validações básicas
    if (!data.employee_id) {
      return constructServerResponse({
        success: false,
        error: "ID do funcionário é obrigatório"
      })
    }
    
    if (!data.street || !data.number || !data.neighborhood || !data.postal_code) {
      return constructServerResponse({
        success: false,
        error: "Dados incompletos do endereço"
      })
    }
    
    if (!data.country_id || !data.state_id || !data.city_id) {
      return constructServerResponse({
        success: false,
        error: "País, estado e cidade são obrigatórios"
      })
    }
    
    // Criar endereço
    const address = await addressService.createEmployeeAddress(data)
    
    // Revalidar cache
    revalidatePath(`/dashboard/employees/${data.employee_id}`)
    
    return constructServerResponse({
      success: true,
      data: address,
      message: "Endereço criado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao criar endereço:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar endereço"
    })
  }
}

/**
 * Atualiza um endereço existente
 * @param id ID do endereço
 * @param data Dados a serem atualizados
 * @returns Endereço atualizado com relações
 */
export async function updateEmployeeAddress(id: string, data: EmployeeAddressUpdate): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    if (!id) {
      return constructServerResponse({
        success: false,
        error: "ID do endereço é obrigatório"
      })
    }
    
    // Buscar endereço para obter o employee_id para revalidação
    const existingAddress = await addressService.getEmployeeAddress(id)
    if (!existingAddress) {
      return constructServerResponse({
        success: false,
        error: "Endereço não encontrado"
      })
    }
    
    // Atualizar endereço
    const address = await addressService.updateEmployeeAddress(id, data)
    
    // Revalidar cache
    revalidatePath(`/dashboard/employees/${existingAddress.employee_id}`)
    
    return constructServerResponse({
      success: true,
      data: address,
      message: "Endereço atualizado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar endereço"
    })
  }
}

/**
 * Remove um endereço
 * @param id ID do endereço
 * @returns Sucesso ou erro
 */
export async function deleteEmployeeAddress(id: string): Promise<ServerResponse> {
  try {
    // Verificar autenticação
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return constructServerResponse({
        success: false,
        error: "Usuário não autenticado"
      })
    }

    if (!id) {
      return constructServerResponse({
        success: false,
        error: "ID do endereço é obrigatório"
      })
    }
    
    // Buscar endereço para obter o employee_id para revalidação
    const existingAddress = await addressService.getEmployeeAddress(id)
    if (!existingAddress) {
      return constructServerResponse({
        success: false,
        error: "Endereço não encontrado"
      })
    }
    
    // Deletar endereço
    await addressService.deleteEmployeeAddress(id)
    
    // Revalidar cache
    revalidatePath(`/dashboard/employees/${existingAddress.employee_id}`)
    
    return constructServerResponse({
      success: true,
      message: "Endereço removido com sucesso"
    })
  } catch (error) {
    console.error("Erro ao remover endereço:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao remover endereço"
    })
  }
} 