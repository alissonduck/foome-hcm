"use client"

/**
 * Componente de diálogo para dependentes
 * Fornece um diálogo para adicionar e editar dependentes
 */
import { EmployeeDependent } from "@/lib/types/documents"
import { DependentFormValues } from "@/lib/schemas/dependent-schema"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DependentForm } from "@/components/dependents/dependent-form"

/**
 * Props para o componente DependentDialog
 */
interface DependentDialogProps {
  employeeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DependentFormValues & { employee_id?: string }) => void
  currentDependent?: EmployeeDependent
  isSubmitting?: boolean
}

/**
 * Diálogo para adicionar e editar dependentes
 * @param employeeId ID do funcionário
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @param onSubmit Função chamada ao enviar o formulário
 * @param currentDependent Dependente atual (para edição)
 * @param isSubmitting Se o formulário está sendo enviado
 * @returns Componente de diálogo para dependente
 */
export function DependentDialog({
  employeeId,
  open,
  onOpenChange,
  onSubmit,
  currentDependent,
  isSubmitting = false,
}: DependentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentDependent ? "Editar" : "Adicionar"} Dependente
          </DialogTitle>
          <DialogDescription>
            {currentDependent
              ? "Atualize as informações do dependente nos campos abaixo."
              : "Preencha os dados do dependente nos campos abaixo."}
          </DialogDescription>
        </DialogHeader>
        
        <DependentForm
          employeeId={employeeId}
          initialData={currentDependent}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
} 