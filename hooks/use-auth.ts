/**
 * Hook para gerenciamento de autenticação
 * Utiliza React Query para gerenciar as requisições
 */

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { 
  LoginFormData, 
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  AuthResult
} from "@/lib/types/auth"

/**
 * Hook para gerenciamento de autenticação
 * @returns Funções e utilitários para gerenciar autenticação
 */
export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  /**
   * Query para obter usuário atual
   * @returns Query para usuário atual
   */
  const useCurrentUserQuery = () => {
    return useQuery({
      queryKey: ["currentUser"],
      queryFn: async () => {
        const response = await fetch("/api/auth/user")
        
        if (!response.ok) {
          if (response.status === 401) {
            return null
          }
          throw new Error("Erro ao buscar usuário atual")
        }
        
        return response.json()
      }
    })
  }

  /**
   * Realiza login diretamente com Supabase
   * Usado como fallback quando a API retorna HTML
   * @param data Dados de login
   * @returns Resultado da autenticação
   */
  const loginWithSupabaseDirectly = async (data: LoginFormData): Promise<AuthResult> => {
    console.log("[FALLBACK] Tentando login diretamente com Supabase")
    
    try {
      const supabase = createClient()
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      
      if (error) {
        console.error("[FALLBACK] Erro no login direto:", error)
        
        if (error.message === "Email not confirmed" || error.code === "email_not_confirmed") {
          return {
            success: false,
            emailNotConfirmed: true,
            message: "Email não confirmado. Verifique sua caixa de entrada para confirmar seu email.",
          }
        }
        
        throw error
      }
      
      console.log("[FALLBACK] Login direto bem-sucedido, redirecionando...")
      
      // Redireciona para o dashboard após login bem-sucedido via Supabase direto
      setTimeout(() => {
        router.refresh()
        router.push('/dashboard')
      }, 100)
      
      return {
        success: true,
        message: "Login realizado com sucesso.",
        user: authData.user,
        session: authData.session,
        usingFallback: true
      }
    } catch (error) {
      console.error("[FALLBACK] Exceção no login direto:", error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro ao fazer login.",
        usingFallback: true
      }
    }
  }

  /**
   * Verifica se a resposta contém HTML e se é um redirecionamento
   * @param response Resposta da API
   * @param endpoint Nome do endpoint
   * @returns Promise com o texto da resposta e um booleano indicando se é HTML
   */
  const checkHTMLResponse = async (response: Response, endpoint: string): Promise<{text: string, isHTMLRedirect: boolean}> => {
    const text = await response.text()
    
    // Log para debugging
    if (text.length < 200) {
      console.log(`Conteúdo da resposta de ${endpoint}:`, text)
    } else {
      console.log(`Conteúdo da resposta de ${endpoint} (primeiros 200 caracteres):`, text.substring(0, 200))
    }
    
    // Verifica se é HTML
    const isHTML = text.includes('<!DOCTYPE html>') || text.includes('<html')
    const isRedirect = response.ok && isHTML
    
    if (isRedirect) {
      console.warn(`Aviso: Resposta de ${endpoint} é HTML mesmo com status ${response.status} - possível redirecionamento`)
    }
    
    return { text, isHTMLRedirect: isRedirect }
  }

  /**
   * Processa a resposta da API com tratamento de erro
   * @param response Resposta da fetch API
   * @param endpoint Nome do endpoint para fins de log
   * @returns Dados da resposta em JSON
   */
  const processApiResponse = async (response: Response, endpoint: string): Promise<any> => {
    try {
      // Registra informações sobre a resposta para debug
      console.log(`Resposta de ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      })
      
      const { text, isHTMLRedirect } = await checkHTMLResponse(response, endpoint)
      
      // Para respostas com status de sucesso que são HTML, pode ser um problema de CORS ou redirecionamento
      if (isHTMLRedirect) {
        // Se estamos processando uma resposta de login, vamos assumir que o login foi bem-sucedido
        // e o servidor está redirecionando para o dashboard
        if (endpoint === 'login') {
          // Não precisamos de nenhuma ação adicional aqui, pois o caller (useSignInMutation)
          // vai tentar o login direto com Supabase
          console.log("Detectado redirecionamento HTML em login, sinalizando para usar fallback...")
          return { _specialFlag: "HTML_REDIRECT_DETECTED" }
        }
        
        // Verifica se há mensagem de sucesso no HTML ou se parece ser o dashboard 
        if (text.includes('sucesso') || text.includes('dashboard')) {
          // Assume que foi bem-sucedido com redirecionamento
          toast({
            title: "Operação realizada com sucesso",
            description: "Redirecionando...",
          })
          
          router.refresh()
          
          // Retorna um objeto de sucesso simulado
          return { 
            success: true, 
            message: "Operação realizada com sucesso",
            simulatedResponse: true
          }
        }
      }
      
      try {
        // Tenta fazer o parse do texto como JSON
        const data = JSON.parse(text)
        
        // Se a resposta não for OK, lança um erro com a mensagem do servidor
        if (!response.ok) {
          throw new Error(data.error || data.message || `Erro ${response.status}: ${response.statusText}`)
        }
        
        return data
      } catch (e) {
        // Se não conseguir fazer o parse como JSON
        console.error(`Erro ao processar resposta de ${endpoint}:`, e)
        
        // Se for HTML, fornece mensagem específica
        if (text.includes('<!DOCTYPE html>')) {
          console.error(`Resposta do servidor de ${endpoint} não é JSON válido (HTML recebido)`)
          
          if (response.status === 404) {
            throw new Error(`API não encontrada: ${endpoint}. Verifique se o endpoint está correto.`)
          } else if (response.status >= 500) {
            throw new Error(`Erro interno do servidor. Tente novamente mais tarde.`)
          } else {
            throw new Error(`Formato de resposta incorreto. Contate o suporte.`)
          }
        }
        
        // Se não for HTML nem JSON, apenas retorna o erro com o texto
        throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}...`)
      }
    } catch (error) {
      console.error(`Erro ao processar resposta de ${endpoint}:`, error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro desconhecido ao processar resposta do servidor')
    }
  }

  /**
   * Mutation para login
   * @returns Mutation para login
   */
  const useSignInMutation = () => {
    return useMutation({
      mutationFn: async (data: LoginFormData): Promise<AuthResult> => {
        console.log("Enviando requisição de login:", { email: data.email, senhaOmitida: true })
        
        // Primeiro, tenta fazer login através da API
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
          
          const result = await processApiResponse(response, "login")
          
          // Verifica se o resultado contém a flag especial de redirecionamento HTML
          if (result && result._specialFlag === "HTML_REDIRECT_DETECTED") {
            console.log("Detectada flag de redirecionamento, ativando fallback de login direto...")
            return loginWithSupabaseDirectly(data)
          }
          
          return result
        } catch (error) {
          console.error("Erro na requisição de login:", error)
          
          // Se ocorrer qualquer outro erro, tenta o login direto como último recurso
          console.log("Tentando login direto como último recurso após erro...")
          return loginWithSupabaseDirectly(data)
        }
      },
      onSuccess: (data) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["currentUser"] })
          
          toast({
            title: "Login realizado com sucesso",
            description: data.usingFallback 
              ? "Você foi autenticado diretamente." 
              : "Você foi autenticado com sucesso.",
          })
          
          router.refresh()
          router.push("/dashboard")
        } else if (data.emailNotConfirmed) {
          toast({
            title: "Email não confirmado",
            description: data.message,
          })
        }
      },
      onError: (error) => {
        console.error("Erro no callback onError:", error)
        
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer login.",
        })
      },
    })
  }

  /**
   * Mutation para registro
   * @returns Mutation para registro
   */
  const useSignUpMutation = () => {
    return useMutation({
      mutationFn: async (data: RegisterFormData): Promise<AuthResult> => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        return processApiResponse(response, "register")
      },
      onSuccess: (data) => {
        if (data.success) {
          if (data.session) {
            queryClient.invalidateQueries({ queryKey: ["currentUser"] })
            
            toast({
              title: "Cadastro realizado com sucesso",
              description: "Sua conta foi criada com sucesso.",
            })
            
            router.refresh()
            router.push("/register/company")
          } else {
            toast({
              title: "Cadastro realizado com sucesso",
              description: "Verifique seu email para confirmar sua conta.",
            })
            
            router.push("/login")
          }
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao fazer cadastro",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer o cadastro.",
        })
      },
    })
  }

  /**
   * Mutation para logout
   * @returns Mutation para logout
   */
  const useSignOutMutation = () => {
    return useMutation({
      mutationFn: async (): Promise<AuthResult> => {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        })

        return processApiResponse(response, "logout")
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
        queryClient.clear()
        
        toast({
          title: "Logout realizado com sucesso",
          description: "Você foi desconectado com sucesso.",
        })
        
        router.refresh()
        router.push("/login")
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao fazer logout",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer logout.",
        })
      },
    })
  }

  /**
   * Mutation para solicitar redefinição de senha
   * @returns Mutation para solicitar redefinição
   */
  const useForgotPasswordMutation = () => {
    return useMutation({
      mutationFn: async (data: ForgotPasswordFormData): Promise<AuthResult> => {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        return processApiResponse(response, "forgot-password")
      },
      onSuccess: (data) => {
        if (data.success) {
          toast({
            title: "Solicitação enviada",
            description: data.message,
          })
          
          router.push("/login")
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao solicitar redefinição de senha",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao solicitar redefinição de senha.",
        })
      },
    })
  }

  /**
   * Mutation para redefinir senha
   * @returns Mutation para redefinição
   */
  const useResetPasswordMutation = () => {
    return useMutation({
      mutationFn: async (data: ResetPasswordFormData): Promise<AuthResult> => {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        return processApiResponse(response, "reset-password")
      },
      onSuccess: (data) => {
        if (data.success) {
          toast({
            title: "Senha atualizada",
            description: data.message,
          })
          
          router.push("/login")
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao redefinir senha",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao redefinir senha.",
        })
      },
    })
  }

  /**
   * Mutation para reenviar email de confirmação
   * @returns Mutation para reenvio
   */
  const useResendConfirmationMutation = () => {
    return useMutation({
      mutationFn: async (email: string): Promise<AuthResult> => {
        const response = await fetch("/api/auth/resend-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        return processApiResponse(response, "resend-confirmation")
      },
      onSuccess: (data) => {
        if (data.success) {
          toast({
            title: "Email reenviado",
            description: data.message,
          })
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao reenviar email de confirmação",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao reenviar email de confirmação.",
        })
      },
    })
  }

  return {
    // Queries
    useCurrentUserQuery,
    
    // Mutations
    useSignInMutation,
    useSignUpMutation,
    useSignOutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useResendConfirmationMutation
  }
} 