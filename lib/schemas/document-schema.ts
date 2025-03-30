/**
 * Schemas de validação para documentos
 * Define os esquemas de validação para documentos de funcionários
 */
import { z } from "zod"

/**
 * Schema para o formulário de upload de documento
 */
export const documentUploadSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres."
  }),
  type: z.string({
    required_error: "Selecione o tipo de documento."
  }),
  employeeId: z.string({
    required_error: "Selecione o funcionário."
  }),
  expirationDate: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "Selecione um arquivo para upload."
  }),
})

/**
 * Tipo derivado do schema de upload
 */
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>

/**
 * Schema para atualização de documento
 */
export const documentUpdateSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do documento deve ter pelo menos 3 caracteres."
  }),
  type: z.string({
    required_error: "Selecione o tipo de documento."
  }),
  status: z.enum(["pending", "approved", "rejected"], {
    required_error: "Selecione o status do documento."
  }),
  expirationDate: z.string().optional(),
})

/**
 * Tipo derivado do schema de atualização
 */
export type DocumentUpdateFormValues = z.infer<typeof documentUpdateSchema>

/**
 * Tipos de documentos disponíveis
 */
export const DOCUMENT_TYPES = [
  { value: "rg", label: "RG" },
  { value: "cpf", label: "CPF" },
  { value: "ctps", label: "CTPS" },
  { value: "pis", label: "PIS/PASEP" },
  { value: "titulo_eleitor", label: "Título de Eleitor" },
  { value: "reservista", label: "Certificado de Reservista" },
  { value: "comprovante_residencia", label: "Comprovante de Residência" },
  { value: "diploma", label: "Diploma" },
  { value: "certificado", label: "Certificado" },
  { value: "carteira_vacinacao", label: "Carteira de Vacinação" },
  { value: "atestado_medico", label: "Atestado Médico" },
  { value: "contrato", label: "Contrato de Trabalho" },
  { value: "outros", label: "Outros" },
]

/**
 * Status de documentos
 */
export const DOCUMENT_STATUS = [
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
] 