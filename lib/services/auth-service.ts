/**
 * Serviço para gerenciamento de autenticação
 * Fornece métodos para interagir com a autenticação do Supabase
 */

import { createClient } from "@/lib/supabase/server"
import type { 
  LoginFormData, 
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  AuthResult
} from "@/lib/types/auth"

export class AuthService {
  /**
   * Realiza login com email e senha
   * @param data Dados de login (email e senha)
   * @returns Resultado da autenticação
   */
  static async signIn(data: LoginFormData): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      
      if (error) {
        if (error.message === "Email not confirmed" || error.code === "email_not_confirmed") {
          return {
            success: false,
            emailNotConfirmed: true,
            message: "Email não confirmado. Verifique sua caixa de entrada para confirmar seu email.",
          }
        }
        
        throw error
      }
      
      return {
        success: true,
        message: "Login realizado com sucesso.",
        user: authData.user,
        session: authData.session,
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      
      // Tratamento de erros específicos
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            message: "Email ou senha incorretos.",
          }
        }
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao fazer login.",
      }
    }
  }
  
  /**
   * Realiza registro de um novo usuário
   * @param data Dados de registro (nome, email, senha, etc)
   * @returns Resultado da autenticação
   */
  static async signUp(data: RegisterFormData): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        },
      })
      
      if (error) throw error
      
      if (authData.user && !authData.session) {
        return {
          success: true,
          message: "Cadastro realizado com sucesso. Verifique seu email para confirmar sua conta.",
          user: authData.user,
        }
      }
      
      return {
        success: true,
        message: "Cadastro realizado com sucesso.",
        user: authData.user,
        session: authData.session,
      }
    } catch (error) {
      console.error("Erro ao fazer registro:", error)
      
      // Tratamento de erros específicos
      if (error instanceof Error) {
        if (error.message.includes("already registered")) {
          return {
            success: false,
            message: "Este email já está cadastrado.",
          }
        }
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao fazer o cadastro.",
      }
    }
  }
  
  /**
   * Realiza logout da sessão atual
   * @returns Resultado da operação
   */
  static async signOut(): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      return {
        success: true,
        message: "Logout realizado com sucesso.",
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao fazer logout.",
      }
    }
  }
  
  /**
   * Solicita redefinição de senha
   * @param data Dados para redefinição (email)
   * @returns Resultado da operação
   */
  static async forgotPassword(data: ForgotPasswordFormData): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: "Enviamos um email com instruções para redefinir sua senha.",
      }
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao solicitar redefinição de senha.",
      }
    }
  }
  
  /**
   * Redefine a senha do usuário
   * @param data Dados da nova senha
   * @returns Resultado da operação
   */
  static async resetPassword(data: ResetPasswordFormData): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: "Senha atualizada com sucesso.",
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao redefinir senha.",
      }
    }
  }
  
  /**
   * Reenvia o email de confirmação
   * @param email Email do usuário
   * @returns Resultado da operação
   */
  static async resendConfirmationEmail(email: string): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        },
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: "Email de confirmação reenviado com sucesso.",
      }
    } catch (error) {
      console.error("Erro ao reenviar email de confirmação:", error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao reenviar email de confirmação.",
      }
    }
  }
  
  /**
   * Obtém usuário atual
   * @returns Usuário atual ou null se não estiver autenticado
   */
  static async getCurrentUser() {
    try {
      const supabase = await createClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        // Verifica se é um erro de sessão ausente (comportamento esperado para usuários não autenticados)
        if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
          return null
        }
        throw error
      }
      
      return user
    } catch (error) {
      // Registra apenas outros tipos de erros não esperados
      console.error("Erro ao obter usuário atual:", error)
      return null
    }
  }
  
  /**
   * Tenta confirmar manualmente o email de um usuário (para ambiente de desenvolvimento)
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Resultado da operação
   */
  static async confirmEmailManually(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = await createClient()
      
      // Primeiro, tenta fazer login normalmente
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Se o login for bem-sucedido, retorna os dados da sessão
      if (data.session) {
        return {
          success: true,
          session: data.session,
          message: "Login realizado com sucesso.",
        }
      }
      
      // Se o erro for de email não confirmado, tenta uma abordagem alternativa
      if (error && (error.message === "Email not confirmed" || error.code === "email_not_confirmed")) {
        // Tenta reenviar o email de confirmação
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
        })
        
        if (resendError) {
          return {
            success: false,
            message: "Não foi possível enviar o email de confirmação. Entre em contato com o suporte.",
          }
        }
        
        return {
          success: false,
          emailNotConfirmed: true,
          message: "Email não confirmado. Um novo email de confirmação foi enviado.",
        }
      }
      
      // Se for outro erro, retorna a mensagem de erro
      return {
        success: false,
        message: error?.message || "Erro desconhecido ao fazer login.",
      }
    } catch (error) {
      console.error("Erro ao confirmar email manualmente:", error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
      }
    }
  }
} 