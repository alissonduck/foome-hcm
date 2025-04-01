/**
 * Utilitários para validação em server actions
 * Fornece funções para validar acesso e permissões
 */
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  success: boolean
  error?: string
}

/**
 * Valida se o usuário tem acesso à empresa do funcionário
 * @param employeeId ID do funcionário
 * @returns Resultado da validação
 */
export async function validateUserCompanyAccess(employeeId: string): Promise<ValidationResult> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return {
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      }
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa do usuário
    const { data: employee, error } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (error || !employee) {
      return {
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error("Erro ao validar acesso à empresa:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao validar acesso"
    }
  }
} 