"use client"

/**
 * Formulário de login
 */
import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { loginSchema } from "@/lib/schemas/auth-schema"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { z } from "zod"

/**
 * Componente de formulário de login
 * @returns Formulário de login
 */
export default function LoginForm() {
  const { useSignInMutation } = useAuth()
  const signInMutation = useSignInMutation()

  // Configuração do formulário com React Hook Form e Zod
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await signInMutation.mutateAsync({
      email: values.email,
      password: values.password,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">Senha</FormLabel>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
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
        <Button 
          type="submit" 
          className="w-full h-11 mt-6 rounded-lg font-medium transition-all" 
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        não tem uma conta?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Crie agora
        </Link>
      </div>
    </Form>
  )
}

