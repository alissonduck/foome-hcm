import type React from "react"
/**
 * Layout para páginas de autenticação
 */
import { Logo } from "@/components/ui/logo"

/**
 * Props para o componente AuthLayout
 */
interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

/**
 * Layout para páginas de autenticação (login e registro)
 * @param children Componente filho (formulário)
 * @param title Título da página
 * @param description Descrição da página
 * @returns Layout para autenticação
 */
export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header minimalista e centralizado */}
      <header className="w-full py-6 px-4 sm:px-8 flex justify-center border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container max-w-7xl flex items-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Card com efeito de vidro e sombra suave */}
          <div className="foome-card hover:shadow-xl">
            {/* Barra de acento superior com gradiente animado */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 animate-gradient"></div>

            <div className="p-8 sm:p-10">
              <div className="space-y-3 mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              {children}

              <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
                <p>
                  Ao continuar, você concorda com nossos{" "}
                  <a href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

