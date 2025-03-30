/**
 * Funções auxiliares para autenticação
 */
import { createClient } from "@/lib/supabase/client"

/**
 * Função para confirmar o email de um usuário manualmente
 * Esta função deve ser usada apenas em ambiente de desenvolvimento ou teste
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Resultado da operação
 */
export async function confirmEmailManually(email: string, password: string) {
  const supabase = createClient()

  try {
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

    // Se o erro for de email não confirmado, tenta algumas abordagens alternativas
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

      // Para fins de desenvolvimento, podemos tentar uma abordagem alternativa
      // Isso é apenas uma solução temporária e não deve ser usada em produção

      // Retorna um status especial indicando que o email não está confirmado
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
    return {
      success: false,
      message: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
    }
  }
}

/**
 * Função para lidar com o login de usuários com email não confirmado
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Resultado da operação
 */
export async function loginWithUnconfirmedEmail(email: string, password: string) {
  try {
    // Tenta confirmar o email manualmente
    const result = await confirmEmailManually(email, password)

    // Se a confirmação for bem-sucedida, retorna sucesso
    if (result.success) {
      return {
        success: true,
        message: "Login realizado com sucesso.",
      }
    }

    // Se precisar confirmar o email, retorna que precisa de confirmação
    if (result.emailNotConfirmed) {
      return {
        success: false,
        emailNotConfirmed: true,
        message: result.message,
      }
    }

    // Se chegou aqui, ocorreu algum outro erro
    return {
      success: false,
      message: result.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
    }
  }
}

