"use client"

/**
 * Formulário de registro de usuário
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Mail, User, Phone, Lock, Loader2 } from "lucide-react"
import { userRegisterSchema } from "@/lib/schemas/register-schema"
import type { UserRegisterFormValues } from "@/lib/schemas/register-schema"
import { registerUser } from "@/server/actions/register-actions"

/**
 * Componente de formulário de registro de usuário
 * @returns Formulário de registro
 */
export default function UserRegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Configuração do formulário com React Hook Form e Zod
  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
  })

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: UserRegisterFormValues) {
    try {
      setIsLoading(true)

      // Chama a server action para registrar o usuário
      const result = await registerUser(values)

      if (!result.success) {
        throw new Error(result.error || "Falha ao criar conta")
      }

      // Se precisar de confirmação de email, informa ao usuário
      if (result.requireEmailConfirmation) {
        toast({
          title: "Conta criada com sucesso",
          description: "Verifique seu email para confirmar sua conta antes de fazer login.",
        })
        router.push("/login")
        return
      }

      // Se foi cadastrado com sucesso e tem sessão
      if (result.data?.session) {
        // Redireciona para a página de registro da empresa
        router.push("/register/company")
        return
      }

      // Caso genérico de sucesso sem sessão (não deveria chegar aqui, mas por segurança)
      toast({
        title: "Conta criada com sucesso",
        description: "Você pode fazer login agora.",
      })
      router.push("/login")
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Nome completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="João Silva" className="pl-10 h-11 rounded-lg" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">E-mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="seu@email.com" className="pl-10 h-11 rounded-lg" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Telefone</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="(11) 98765-4321" className="pl-10 h-11 rounded-lg" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="******" className="pl-10 h-11 rounded-lg" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11 mt-6 rounded-lg font-medium transition-all" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Faça login
        </Link>
      </div>
    </Form>
  )
} 