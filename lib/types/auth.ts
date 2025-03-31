/**
 * Tipos para autenticação
 * Define os tipos utilizados para autenticação e gerenciamento de sessão
 */

// Dados do formulário de login
export interface LoginFormData {
  email: string
  password: string
}

// Dados do formulário de registro
export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  phone?: string
}

// Dados do formulário de esqueci minha senha
export interface ForgotPasswordFormData {
  email: string
}

// Dados do formulário de redefinição de senha
export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

// Resultado da autenticação
export interface AuthResult {
  success: boolean
  message: string
  user?: any
  session?: any
  emailNotConfirmed?: boolean
  usingFallback?: boolean
  simulatedResponse?: boolean
}

// Dados do usuário autenticado
export interface AuthUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role?: string
}

// Dados da sessão
export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
} 