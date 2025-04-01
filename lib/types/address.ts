/**
 * Tipos relacionados a endereços
 * Define tipos para países, estados, cidades e endereços de funcionários
 */

/**
 * Interface para representar um país
 */
export interface Country {
  id: string
  name: string
  abbreviation: string
  phone_code: string | null
  created_at: string
  updated_at: string
}

/**
 * Interface para representar um estado
 */
export interface State {
  id: string
  name: string
  abbreviation: string
  country_id: string
  created_at: string
  updated_at: string
}

/**
 * Interface para representar uma cidade
 */
export interface City {
  id: string
  name: string
  phone_code: string | null
  state_id: string
  created_at: string
  updated_at: string
}

/**
 * Interface para representar um endereço de funcionário
 */
export interface EmployeeAddress {
  id: string
  employee_id: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  postal_code: string
  country_id: string
  state_id: string
  city_id: string
  created_at: string
  updated_at: string
}

/**
 * Interface para inserção de endereço de funcionário
 */
export interface EmployeeAddressInsert {
  employee_id: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  postal_code: string
  country_id: string
  state_id: string
  city_id: string
}

/**
 * Interface para atualização de endereço de funcionário
 */
export interface EmployeeAddressUpdate {
  street?: string
  number?: string
  complement?: string | null
  neighborhood?: string
  postal_code?: string
  country_id?: string
  state_id?: string
  city_id?: string
}

/**
 * Interface para endereço com dados relacionados
 */
export interface EmployeeAddressWithRelations extends EmployeeAddress {
  country: Country
  state: State
  city: City
} 