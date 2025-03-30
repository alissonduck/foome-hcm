/**
 * Componente de logo da aplicação
 */
import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  width?: number
  height?: number
  href?: string
}

/**
 * Componente de logo da Foome
 * @param className Classes adicionais para o componente
 * @param width Largura da logo
 * @param height Altura da logo
 * @param href Link para redirecionamento ao clicar na logo
 * @returns Componente de logo
 */
export function Logo({ className, width = 120, height = 40, href = "/" }: LogoProps) {
  // Usando diretamente a URL externa da logo
  const logoUrl = "https://dashboard-staging.foome.co/foome_logo.svg"

  const logo = (
    <Image
      src={logoUrl || "/placeholder.svg"}
      alt="Foome Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logo}
      </Link>
    )
  }

  return logo
}

