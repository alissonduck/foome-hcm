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