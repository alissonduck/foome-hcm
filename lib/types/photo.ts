/**
 * Tipos relacionados a fotos de funcionários
 * Define interfaces para representar fotos de funcionários
 */

/**
 * Interface para representar uma foto de funcionário
 */
export interface EmployeePhoto {
  id: string
  employee_id: string
  admission_photo: string | null
  created_at: string
  updated_at: string
}

/**
 * Interface para inserção de foto de funcionário
 */
export interface EmployeePhotoInsert {
  employee_id: string
  admission_photo: string | null
}

/**
 * Interface para atualização de foto de funcionário
 */
export interface EmployeePhotoUpdate {
  admission_photo?: string | null
}

/**
 * Interface para dados de upload
 */
export interface PhotoUploadData {
  fileData: File
  filePath: string
  contentType: string
}

/**
 * Interface para resultado de upload
 */
export interface PhotoUploadResult {
  path: string | null
  error: string | null
} 