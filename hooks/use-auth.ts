/**
 * Hook para gerenciamento de autenticação
 * Utiliza React Query para gerenciar as requisições
 */

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
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
   * Processa a resposta da API com tratamento de erro
   * @param response Resposta da fetch API
   * @returns Dados da resposta em JSON
   */
  const processApiResponse = async (response: Response): Promise<any> => {
    try {
      const text = await response.text()
      
      try {
        // Tenta fazer o parse do texto como JSON
        const data = JSON.parse(text)
        
        // Se a resposta não for OK, lança um erro com a mensagem do servidor
        if (!response.ok) {
          throw new Error(data.error || data.message || `Erro ${response.status}: ${response.statusText}`)
        }
        
        return data
      } catch (e) {
        // Se não conseguir fazer o parse como JSON, pode ser um erro HTML
        if (text.includes('<!DOCTYPE html>')) {
          console.error('Resposta do servidor não é um JSON válido (HTML recebido)')
          throw new Error(`Erro no servidor (${response.status}). Tente novamente mais tarde.`)
        }
        
        // Se não for HTML nem JSON, apenas retorna o erro com o texto
        throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}...`)
      }
    } catch (error) {
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
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        return processApiResponse(response)
      },
      onSuccess: (data) => {
        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["currentUser"] })
          
          toast({
            title: "Login realizado com sucesso",
            description: "Você foi autenticado com sucesso.",
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

        return processApiResponse(response)
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

        return processApiResponse(response)
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

        return processApiResponse(response)
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

        return processApiResponse(response)
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

        return processApiResponse(response)
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