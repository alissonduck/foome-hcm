"use client"

/**
 * Componente de navegação mobile (menu hamburger)
 */
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  User,
  Calendar,
  Settings,
  Building,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

/**
 * Componente de navegação mobile (menu hamburger)
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de navegação mobile
 */
export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Lista de itens de navegação
  const navItems = [
    {
      name: "dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "funcionários",
      href: "/dashboard/employees",
      icon: Users,
    },
    {
      name: "documentos",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      name: "admissão",
      href: "/dashboard/admission",
      icon: UserPlus,
    },
    {
      name: "férias e ausências",
      href: "/dashboard/time-off",
      icon: Calendar,
    },
    {
      name: "perfil",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  // Itens adicionais para administradores
  const adminItems = [
    {
      name: "configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      name: "empresa",
      href: "/dashboard/company",
      icon: Building,
    },
  ]

  /**
   * Verifica se o item está ativo com base no pathname
   * @param href URL do item
   * @returns Verdadeiro se o item estiver ativo
   */
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  /**
   * Função para lidar com o logout
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao sair",
        description: "ocorreu um erro ao tentar sair da aplicação.",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <img src="https://dashboard-staging.foome.co/foome_logo.svg" alt="foome" className="h-8" />
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}

              {isAdmin && (
                <>
                  <li className="px-3 py-2">
                    <div className="text-xs font-medium text-muted-foreground">administração</div>
                  </li>
                  {adminItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>
          <div className="border-t p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>sair</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

