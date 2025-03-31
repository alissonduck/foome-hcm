/**
 * Tipos para documentos
 * Define os tipos utilizados para gerenciar documentos
 */

import type { Database } from "./supabase"

// Tipos básicos para documentos
export type EmployeeDocument = Database["public"]["Tables"]["employee_documents"]["Row"]
export type EmployeeDocumentInsert = Database["public"]["Tables"]["employee_documents"]["Insert"]
export type EmployeeDocumentUpdate = Database["public"]["Tables"]["employee_documents"]["Update"]

// Tipo para documento com informações do funcionário
export interface DocumentWithEmployee extends EmployeeDocument {
  employees?: {
    id: string
    full_name: string
    email?: string
  } | null
}

// Status de documento
export type DocumentStatus = "pending" | "approved" | "rejected"

// Interface para o resultado de upload
export interface DocumentUploadResult {
  filePath: string
  fileName: string
  fileType: string
  fileSize: number
}

// Interface para filtros de documentos
export interface DocumentFilters {
  employeeId?: string | "all"
  status?: DocumentStatus | "all"
  search?: string
}

// Interface para metadados de documento
export interface DocumentMetadata {
  contentType: string
  size: number
  lastModified?: string
  cacheControl?: string
}

/**
 * Tipos relacionados a dependentes de funcionários
 */

/**
 * Enum para tipos de relacionamento de dependentes
 */
export enum DependentRelationship {
  CHILD = "child",
  STEPCHILD = "stepchild",
  FOSTER_CHILD = "foster_child",
  LEGAL_WARD = "legal_ward",
  OTHER = "other"
}

/**
 * Enum para gênero dos dependentes
 */
export enum DependentGender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

/**
 * Interface para representar um dependente
 */
export interface EmployeeDependent {
  id: string
  employee_id: string
  full_name: string
  cpf: string | null
  birth_date: string
  relationship: DependentRelationship
  gender: DependentGender
  birth_certificate_number: string | null
  has_disability: boolean
  is_student: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Interface para inserção de dependente
 */
export interface EmployeeDependentInsert {
  employee_id: string
  full_name: string
  cpf?: string | null
  birth_date: string
  relationship: DependentRelationship
  gender: DependentGender
  birth_certificate_number?: string | null
  has_disability?: boolean
  is_student?: boolean
  notes?: string | null
}

/**
 * Interface para atualização de dependente
 */
export interface EmployeeDependentUpdate {
  full_name?: string
  cpf?: string | null
  birth_date?: string
  relationship?: DependentRelationship
  gender?: DependentGender
  birth_certificate_number?: string | null
  has_disability?: boolean
  is_student?: boolean
  notes?: string | null
}

/**
 * Interface que inclui também informações do funcionário
 */
export interface DependentWithEmployee extends EmployeeDependent {
  employee: {
    id: string
    full_name: string
  }
} 