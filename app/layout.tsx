import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Foome - Gestão de Funcionários",
  description: "Plataforma SaaS para gestão de funcionários",
    generator: 'v0.dev'
}

/**
 * Layout raiz da aplicação
 * Configura a fonte, os metadados e os provedores globais
 *
 * @param children - Componentes filhos que serão renderizados dentro do layout
 * @returns Layout raiz configurado
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}



import './globals.css'