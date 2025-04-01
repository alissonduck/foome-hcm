/**
 * Tipos para registro de usuário e empresa
 * Define os tipos utilizados para processos de registro
 */

// Interfaces para registro de usuário
export interface UserRegisterData {
  fullName: string
  email: string
  password: string
  phone: string
}

// Interfaces para registro de administrador
export interface AdminData {
  fullName: string
  email: string
  phone: string
  position: string
  department: string
}

// Interfaces para registro de empresa
export interface CompanyData {
  name: string
  cnpj: string
  sizeRange: string
  created_by: string
}

// Resultado de operação de registro
export interface RegisterResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

// Dados para criar o funcionário administrador
export interface AdminEmployeeData {
  company_id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  position: string
  department: string
  status: string
  contract_type: string
  is_admin: boolean
  created_by: string
} 