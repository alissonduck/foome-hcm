"use client"

/**
 * Diálogo para confirmação de email
 */
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Mail } from "lucide-react"

/**
 * Props para o componente EmailConfirmationDialog
 */
interface EmailConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

/**
 * Componente de diálogo para confirmação de email
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param email Email do usuário
 * @returns Diálogo para confirmação de email
 */
export default function EmailConfirmationDialog({ open, onOpenChange, email }: EmailConfirmationDialogProps) {
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * Função para reenviar o email de confirmação
   */
  const handleResendEmail = async () => {
    try {
      setIsResending(true)

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Email enviado com sucesso",
        description: "Verifique sua caixa de entrada e confirme seu email para fazer login.",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar o email de confirmação.",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmação de Email</DialogTitle>
          <DialogDescription>
            Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada ou solicite um novo email de
            confirmação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          <Mail className="h-16 w-16 text-primary mb-4" />
          <p className="text-center text-sm text-muted-foreground">
            Um email de confirmação foi enviado para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleResendEmail} disabled={isResending}>
            {isResending ? "Enviando..." : "Reenviar Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

