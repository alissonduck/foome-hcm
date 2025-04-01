/**
 * Serviço para gerenciar operações relacionadas a endereços
 * Fornece métodos para listar, buscar, criar, atualizar e deletar países, estados, cidades e endereços
 */
import { createClient } from "@/lib/supabase/server"
import { 
  Country, 
  State, 
  City, 
  EmployeeAddress,
  EmployeeAddressInsert,
  EmployeeAddressUpdate,
  EmployeeAddressWithRelations
} from "@/lib/types/address"

/**
 * Classe de serviço para endereços
 */
export class AddressService {
  /**
   * Obtém cliente do Supabase
   * @returns Cliente do Supabase
   */
  private async getSupabase() {
    return await createClient()
  }

  // MÉTODOS PARA PAÍSES

  /**
   * Lista todos os países
   * @returns Lista de países
   */
  async listCountries(): Promise<Country[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("name")

    if (error) throw error
    return data || []
  }

  /**
   * Busca um país pelo ID
   * @param id ID do país
   * @returns País encontrado ou null se não encontrado
   */
  async getCountry(id: string): Promise<Country | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  // MÉTODOS PARA ESTADOS

  /**
   * Lista todos os estados de um país
   * @param countryId ID do país
   * @returns Lista de estados
   */
  async listStates(countryId: string): Promise<State[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("states")
      .select("*")
      .eq("country_id", countryId)
      .order("name")

    if (error) throw error
    return data || []
  }

  /**
   * Busca um estado pelo ID
   * @param id ID do estado
   * @returns Estado encontrado ou null se não encontrado
   */
  async getState(id: string): Promise<State | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("states")
      .select("*")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  // MÉTODOS PARA CIDADES

  /**
   * Lista todas as cidades de um estado
   * @param stateId ID do estado
   * @returns Lista de cidades
   */
  async listCities(stateId: string): Promise<City[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("state_id", stateId)
      .order("name")

    if (error) throw error
    return data || []
  }

  /**
   * Busca uma cidade pelo ID
   * @param id ID da cidade
   * @returns Cidade encontrada ou null se não encontrada
   */
  async getCity(id: string): Promise<City | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  // MÉTODOS PARA ENDEREÇOS DE FUNCIONÁRIOS

  /**
   * Lista todos os endereços de um funcionário
   * @param employeeId ID do funcionário
   * @returns Lista de endereços com dados relacionados
   */
  async listEmployeeAddresses(employeeId: string): Promise<EmployeeAddressWithRelations[]> {
    const supabase = await this.getSupabase()
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
  }

  /**
   * Busca um endereço pelo ID
   * @param id ID do endereço
   * @returns Endereço encontrado ou null se não encontrado
   */
  async getEmployeeAddress(id: string): Promise<EmployeeAddressWithRelations | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_addresses")
      .select(`
        *,
        country:countries(*),
        state:states(*),
        city:cities(*)
      `)
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  /**
   * Cria um novo endereço para um funcionário
   * @param address Dados do endereço
   * @returns Endereço criado com dados relacionados
   */
  async createEmployeeAddress(address: EmployeeAddressInsert): Promise<EmployeeAddressWithRelations> {
    const supabase = await this.getSupabase()
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
  }

  /**
   * Atualiza um endereço existente
   * @param id ID do endereço
   * @param address Dados a serem atualizados
   * @returns Endereço atualizado com dados relacionados
   */
  async updateEmployeeAddress(id: string, address: EmployeeAddressUpdate): Promise<EmployeeAddressWithRelations> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_addresses")
      .update(address)
      .eq("id", id)
      .select(`
        *,
        country:countries(*),
        state:states(*),
        city:cities(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Remove um endereço
   * @param id ID do endereço
   */
  async deleteEmployeeAddress(id: string): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from("employee_addresses")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
} 