/**
 * Esquemas de validação para autenticação
 * Utiliza a biblioteca Zod para validar os dados de entrada relacionados à autenticação
 */

import { z } from "zod"

/**
 * Esquema para validação do formulário de login
 */
export const loginSchema = z.object({
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
})

/**
 * Esquema para validação do formulário de registro
 */
export const registerSchema = z.object({
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
  phone: z.string().optional(),
})

/**
 * Esquema para validação do formulário de esqueci minha senha
 */
export const forgotPasswordSchema = z.object({
  email: z.string({
    required_error: "O e-mail é obrigatório.",
  }).email({
    message: "Digite um e-mail válido.",
  }),
})

/**
 * Esquema para validação do formulário de redefinição de senha
 */
export const resetPasswordSchema = z.object({
  password: z.string({
    required_error: "A nova senha é obrigatória.",
  }).min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  confirmPassword: z.string({
    required_error: "A confirmação de senha é obrigatória.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
})

/**
 * Esquema para validação da confirmação de email
 */
export const confirmEmailSchema = z.object({
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
})

/**
 * Esquema para validação da atualização de perfil
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }).optional(),
  email: z.string().email({
    message: "Digite um e-mail válido.",
  }).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
}) 