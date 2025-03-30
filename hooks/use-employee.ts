"use client"

/**
 * Hook para gerenciar operações de funcionários
 */
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * Hook para excluir um funcionário
 * @returns Funções e estados para excluir um funcionário
 */
export function useDeleteEmployee() {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  /**
   * Função para excluir um funcionário
   * @param employeeId ID do funcionário a ser excluído
   */
  const deleteEmployee = async (employeeId: string) => {
    try {
      setIsDeleting(true)

      // Exclui os documentos do funcionário
      await supabase.from("employee_documents").delete().eq("employee_id", employeeId)

      // Exclui as férias e ausências do funcionário
      await supabase.from("time_off").delete().eq("employee_id", employeeId)

      // Exclui as tarefas de onboarding do funcionário
      await supabase.from("employee_onboarding").delete().eq("employee_id", employeeId)

      // Exclui o funcionário
      const { error } = await supabase.from("employees").delete().eq("id", employeeId)

      if (error) {
        throw error
      }

      return true
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteEmployee,
    isDeleting,
  }
}

