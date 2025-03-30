/**
 * Tipos utilizados na aplicação
 */

// Tipo para o formulário de registro
export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  phone: string
}

// Tipo para o formulário de empresa
export interface CompanyFormData {
  name: string
  cnpj: string
  sizeRange: string
}

// Tipo para o formulário de login
export interface LoginFormData {
  email: string
  password: string
}

// Tipo para o formulário de admissão de funcionário
export interface EmployeeFormData {
  // Dados pessoais
  fullName: string
  email: string
  phone: string
  cpf: string
  rg: string
  maritalStatus: string
  educationLevel: string
  dependents: string

  // Dados profissionais
  position: string
  department: string
  contractType: string
  hireDate: string

  // Dados específicos CLT
  pis?: string
  ctps?: string

  // Dados específicos PJ
  cnpj?: string
  companyName?: string
  serviceDescription?: string

  // Endereço
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }

  // Dados bancários
  bankInfo: {
    bankName: string
    accountType: string
    agency: string
    account: string
    pixKey?: string
  }

  // Contato de emergência
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
}

// Tipo para os filtros de funcionários
export interface EmployeeFilters {
  status: string
  department?: string
  search?: string
}

// Enums para status de funcionário
export enum EmployeeStatus {
  ACTIVE = "active",
  VACATION = "vacation",
  TERMINATED = "terminated",
  MATERNITY_LEAVE = "maternity_leave",
  SICK_LEAVE = "sick_leave",
}

// Enums para tipo de contrato
export enum ContractType {
  CLT = "clt",
  PJ = "pj",
}

// Enums para estado civil
export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
}

// Enums para nível de educação
export enum EducationLevel {
  ELEMENTARY = "elementary",
  HIGH_SCHOOL = "high_school",
  TECHNICAL = "technical",
  BACHELOR = "bachelor",
  MASTER = "master",
  DOCTORATE = "doctorate",
}

