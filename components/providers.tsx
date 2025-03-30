"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"

/**
 * Componente que fornece os provedores necessários para a aplicação
 * Inclui o QueryClientProvider para o React Query e o ThemeProvider para o tema
 *
 * @param children - Componentes filhos que serão envolvidos pelos provedores
 * @returns Componente com os provedores configurados
 */
export function Providers({ children }: { children: ReactNode }) {
  // Cria uma instância do QueryClient para cada sessão do usuário
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

