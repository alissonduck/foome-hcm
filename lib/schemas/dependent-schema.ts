/**
 * Esquemas de validação para dependentes
 */
import { z } from "zod"
import { DependentGender, DependentRelationship } from "@/lib/types/documents"

/**
 * Esquema para criação de dependente
 */
export const dependentCreateSchema = z.object({
  employee_id: z.string({
    required_error: "ID do funcionário é obrigatório"
  }),
  full_name: z.string().min(3, { 
    message: "Nome completo deve ter pelo menos 3 caracteres" 
  }),
  cpf: z.string().min(11, { 
    message: "CPF deve ter 11 dígitos" 
  }).optional().nullable(),
  birth_date: z.string({
    required_error: "Data de nascimento é obrigatória"
  }),
  relationship: z.nativeEnum(DependentRelationship, {
    required_error: "Tipo de relação é obrigatório"
  }),
  gender: z.nativeEnum(DependentGender, {
    required_error: "Gênero é obrigatório"
  }),
  birth_certificate_number: z.string().optional().nullable(),
  has_disability: z.boolean().default(false),
  is_student: z.boolean().default(false),
  notes: z.string().optional().nullable()
})

/**
 * Esquema para atualização de dependente
 */
export const dependentUpdateSchema = z.object({
  full_name: z.string().min(3, { 
    message: "Nome completo deve ter pelo menos 3 caracteres" 
  }).optional(),
  cpf: z.string().min(11, { 
    message: "CPF deve ter 11 dígitos" 
  }).optional().nullable(),
  birth_date: z.string().optional(),
  relationship: z.nativeEnum(DependentRelationship).optional(),
  gender: z.nativeEnum(DependentGender).optional(),
  birth_certificate_number: z.string().optional().nullable(),
  has_disability: z.boolean().optional(),
  is_student: z.boolean().optional(),
  notes: z.string().optional().nullable()
})

/**
 * Tipo para os valores do formulário de criação
 */
export type DependentCreateFormValues = z.infer<typeof dependentCreateSchema>

/**
 * Tipo para os valores do formulário de atualização
 */
export type DependentUpdateFormValues = z.infer<typeof dependentUpdateSchema>

/**
 * Esquema para o formulário de dependente
 */
export const dependentFormSchema = z.object({
  full_name: z.string().min(3, {
    message: "Nome completo deve ter pelo menos 3 caracteres"
  }),
  cpf: z.string().optional(),
  birth_date: z.string({
    required_error: "Data de nascimento é obrigatória"
  }),
  relationship: z.nativeEnum(DependentRelationship, {
    required_error: "Tipo de relação é obrigatório"
  }),
  gender: z.nativeEnum(DependentGender, {
    required_error: "Gênero é obrigatório"
  }),
  birth_certificate_number: z.string().optional(),
  has_disability: z.boolean().default(false),
  is_student: z.boolean().default(false),
  notes: z.string().optional()
})

/**
 * Tipo para os valores do formulário
 */
export type DependentFormValues = z.infer<typeof dependentFormSchema> 