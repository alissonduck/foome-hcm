/**
 * Esquemas de validação para registro de usuário e empresa
 * Utiliza Zod para validar os dados de entrada do processo de registro
 */

import { z } from "zod"

/**
 * Esquema para validação do formulário de registro de usuário
 */
export const userRegisterSchema = z.object({
  fullName: z.string({
    required_error: "O nome completo é obrigatório.",
  }).min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  email: z.string({
    required_error: "O e-mail é obrigatório.",
  }).email({
    message: "Digite um e-mail válido.",
  }),
  password: z.string({
    required_error: "A senha é obrigatória.",
  }).min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  phone: z.string().min(10, {
    message: "Digite um telefone válido com pelo menos 10 dígitos.",
  }),
})

/**
 * Esquema para validação dos dados do administrador
 */
export const adminFormSchema = z.object({
  fullName: z.string().min(3, {
    message: "O nome completo deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Digite um e-mail válido.",
  }),
  phone: z.string().min(10, {
    message: "Digite um telefone válido.",
  }),
  position: z.string().min(2, {
    message: "Digite um cargo válido.",
  }),
  department: z.string().min(2, {
    message: "Digite um departamento válido.",
  }),
})

/**
 * Esquema para validação dos dados da empresa
 */
export const companyFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome da empresa deve ter pelo menos 3 caracteres.",
  }),
  cnpj: z.string().min(14, {
    message: "Digite um CNPJ válido.",
  }),
  sizeRange: z.string({
    required_error: "Selecione o porte da empresa.",
  }),
})

// Tipos exportados derivados dos schemas
export type UserRegisterFormValues = z.infer<typeof userRegisterSchema>
export type AdminFormValues = z.infer<typeof adminFormSchema>
export type CompanyFormValues = z.infer<typeof companyFormSchema> 