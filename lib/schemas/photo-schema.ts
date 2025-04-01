"use client"

/**
 * Esquemas de validação para fotos de funcionários
 * Define os esquemas de validação para fotos de funcionários
 */
import { z } from "zod"

/**
 * Esquema para validação de foto de funcionário
 */
export const employeePhotoSchema = z.object({
  employee_id: z.string({
    required_error: "ID do funcionário é obrigatório",
  }),
  admission_photo: z.string().nullable().optional(),
})

/**
 * Esquema para validação de upload de foto
 */
export const photoUploadSchema = z.object({
  fileData: z.instanceof(File, {
    message: "Arquivo inválido",
  })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Arquivo muito grande (máximo: 5MB)",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      {
        message: "Formato de arquivo inválido. Use JPEG ou PNG.",
      }
    ),
  filePath: z.string(),
  contentType: z.string(),
})

/**
 * Tipo para os valores do formulário de foto
 */
export type EmployeePhotoFormValues = z.infer<typeof employeePhotoSchema>

/**
 * Tipo para os valores do formulário de upload de foto
 */
export type PhotoUploadFormValues = z.infer<typeof photoUploadSchema> 