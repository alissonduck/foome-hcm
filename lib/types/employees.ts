/**
 * Tipos para funcionários
 * Define os tipos utilizados para gerenciar funcionários
 */

import type { Database } from "@/lib/supabase/types"

// Tipos básicos para funcionários
export type Employee = Database["public"]["Tables"]["employees"]["Row"]
export type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"]
export type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"]

// Tipo para funcionário com informações da empresa
export interface EmployeeWithCompany extends Employee {
  company?: {
    id: string
    name: string
    cnpj?: string
  } | null
}

// Tipo para funcionário com informações de cargo
export interface EmployeeWithRole extends Employee {
  roles?: {
    id: string
    title: string
    level?: string | null
  }[] | null
  current_role?: {
    id: string
    title: string
    level?: string | null
  } | null
}

// Status de funcionário
export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated"

// Tipos de contrato
export type ContractType = "clt" | "pj" | "intern" | "freelancer" | "temporary"

// Interface para filtros de funcionários
export interface EmployeeFilters {
  search?: string
  status?: EmployeeStatus | "all"
  department?: string | "all"
  team?: string | "all"
}

// Interface para endereço
export interface EmployeeAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipcode: string
  country: string
}

// Interface para informações bancárias
export interface BankInfo {
  bank_name: string
  agency: string
  account: string
  account_type: string
  pix_key?: string
}

// Interface para contato de emergência
export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
} 