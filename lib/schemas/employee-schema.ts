"use client"

/**
 * Schemas de validação para funcionários
 * Define os esquemas de validação para funcionários
 */
import { z } from "zod"

// Schema para endereço
const addressSchema = z.object({
  street: z.string().min(3, { message: "Rua deve ter pelo menos 3 caracteres" }),
  number: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, { message: "Bairro deve ter pelo menos 2 caracteres" }),
  city: z.string().min(2, { message: "Cidade deve ter pelo menos 2 caracteres" }),
  state: z.string().min(2, { message: "Estado deve ter pelo menos 2 caracteres" }),
  zipcode: z.string().min(8, { message: "CEP deve ter pelo menos 8 caracteres" }),
  country: z.string().min(2, { message: "País deve ter pelo menos 2 caracteres" }).default("Brasil"),
})

// Schema para informações bancárias
const bankInfoSchema = z.object({
  bank_name: z.string().min(3, { message: "Nome do banco deve ter pelo menos 3 caracteres" }),
  agency: z.string().min(1, { message: "Agência é obrigatória" }),
  account: z.string().min(1, { message: "Conta é obrigatória" }),
  account_type: z.string().min(1, { message: "Tipo de conta é obrigatório" }),
  pix_key: z.string().optional(),
})

// Schema para contato de emergência
const emergencyContactSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  relationship: z.string().min(2, { message: "Relacionamento deve ter pelo menos 2 caracteres" }),
  phone: z.string().min(8, { message: "Telefone deve ter pelo menos 8 caracteres" }),
})

/**
 * Schema para criação de funcionário
 */
export const employeeCreateSchema = z.object({
  full_name: z.string().min(3, { 
    message: "Nome completo deve ter pelo menos 3 caracteres" 
  }),
  email: z.string().email({ 
    message: "E-mail inválido" 
  }),
  phone: z.string().min(8, { 
    message: "Telefone deve ter pelo menos 8 caracteres" 
  }).optional(),
  cpf: z.string().min(11, { 
    message: "CPF deve ter 11 dígitos" 
  }).optional(),
  rg: z.string().min(8, { 
    message: "RG deve ter pelo menos 8 dígitos" 
  }).optional(),
  pis: z.string().optional(),
  ctps: z.string().optional(),
  cnpj: z.string().min(14, { 
    message: "CNPJ deve ter 14 dígitos" 
  }).optional(),
  marital_status: z.string().optional(),
  hire_date: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  contract_type: z.enum(["clt", "pj", "intern", "freelancer", "temporary"], {
    required_error: "Tipo de contrato é obrigatório"
  }),
  status: z.enum(["active", "inactive", "on_leave", "terminated"], {
    required_error: "Status é obrigatório"
  }).default("active"),
  address: addressSchema.optional(),
  bank_info: bankInfoSchema.optional(),
  emergency_contact: emergencyContactSchema.optional(),
  service_description: z.string().optional(),
  company_name: z.string().optional(),
  is_admin: z.boolean().default(false),
  company_id: z.string({
    required_error: "ID da empresa é obrigatório"
  }),
})

/**
 * Schema para atualização de funcionário
 */
export const employeeUpdateSchema = employeeCreateSchema.partial().omit({
  company_id: true,
})

/**
 * Tipo derivado do schema de criação
 */
export type EmployeeFormValues = z.infer<typeof employeeCreateSchema>

/**
 * Tipo derivado do schema de atualização
 */
export type EmployeeUpdateValues = z.infer<typeof employeeUpdateSchema>

/**
 * Tipos de contrato disponíveis
 */
export const CONTRACT_TYPES = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "intern", label: "Estagiário" },
  { value: "freelancer", label: "Freelancer" },
  { value: "temporary", label: "Temporário" },
]

/**
 * Status disponíveis
 */
export const EMPLOYEE_STATUS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "on_leave", label: "Afastado" },
  { value: "terminated", label: "Desligado" },
]

/**
 * Estados civis disponíveis
 */
export const MARITAL_STATUS = [
  { value: "single", label: "Solteiro(a)" },
  { value: "married", label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed", label: "Viúvo(a)" },
  { value: "separate", label: "Separado(a)" },
  { value: "stable_union", label: "União Estável" },
] 