"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

/**
 * Provedor de tema para a aplicação
 * Utiliza o next-themes para gerenciar o tema (claro/escuro/sistema)
 *
 * @param props - Propriedades do provedor de tema
 * @returns Componente provedor de tema configurado
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

