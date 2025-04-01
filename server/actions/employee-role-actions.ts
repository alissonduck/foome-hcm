"use server"

/**
 * Server actions para gerenciamento de movimentações de cargos
 * Fornece ações do servidor para operações com movimentações de cargos
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { CreateEmployeeRoleInput, UpdateEmployeeRoleInput } from "@/lib/types/employee-role"
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"

/**
 * Obtém todas as movimentações de cargo de um funcionário
 * @param employeeId ID do funcionário
 * @returns Movimentações de cargo do funcionário
 */
export async function getEmployeeRoles(employeeId: string): Promise<ServerResponse> {
  try {
    if (!employeeId) {
      return constructServerResponse({
        success: false,
        error: "ID do funcionário não fornecido"
      })
    }
    
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Primeiro verifica se o funcionário pertence à empresa atual
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (!employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      })
    }
    
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        role:roles(*)
      `)
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })
    
    if (error) throw error
    
    return constructServerResponse({
      success: true,
      data,
      message: "Movimentações de cargo obtidas com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar movimentações de cargo:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar as movimentações de cargo: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém o cargo atual de um funcionário
 * @param employeeId ID do funcionário
 * @returns Cargo atual do funcionário
 */
export async function getCurrentRole(employeeId: string): Promise<ServerResponse> {
  try {
    if (!employeeId) {
      return constructServerResponse({
        success: false,
        error: "ID do funcionário não fornecido"
      })
    }
    
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Primeiro verifica se o funcionário pertence à empresa atual
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (!employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      })
    }
    
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        role:roles(*)
      `)
      .eq("employee_id", employeeId)
      .eq("is_current", true)
      .single()
    
    if (error && error.code !== "PGRST116") throw error
    
    return constructServerResponse({
      success: true,
      data,
      message: "Cargo atual obtido com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar cargo atual:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar o cargo atual: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Cria uma nova movimentação de cargo
 * @param input Dados da movimentação
 * @returns Movimentação de cargo criada
 */
export async function createEmployeeRole(input: CreateEmployeeRoleInput): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem registrar movimentações de cargo"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa atual
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", input.employee_id)
      .eq("company_id", company.id)
      .single()
    
    if (!employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      })
    }
    
    // Verifica se o cargo pertence à empresa atual
    const { data: role } = await supabase
      .from("roles")
      .select("id, company_id")
      .eq("id", input.role_id)
      .eq("company_id", company.id)
      .single()
    
    if (!role) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado ou não pertence à sua empresa"
      })
    }
    
    // Se marcado como cargo atual, atualiza os outros cargos
    if (input.is_current) {
      await supabase
        .from("employee_roles")
        .update({ 
          is_current: false,
          end_date: input.start_date
        })
        .eq("employee_id", input.employee_id)
        .eq("is_current", true)
    }
    
    // Adiciona o ID da empresa
    const newRole = {
      ...input,
      company_id: company.id
    }
    
    const { data, error } = await supabase
      .from("employee_roles")
      .insert([newRole])
      .select(`
        *,
        role:roles(*)
      `)
      .single()
    
    if (error) throw error
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${input.employee_id}`)
    revalidatePath(`/dashboard/employees/${input.employee_id}/movimentacoes`)
    
    return constructServerResponse({
      success: true,
      data,
      message: "Movimentação de cargo criada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao criar movimentação de cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar movimentação de cargo"
    })
  }
}

/**
 * Atualiza uma movimentação de cargo existente
 * @param id ID da movimentação
 * @param input Dados atualizados
 * @returns Movimentação de cargo atualizada
 */
export async function updateEmployeeRole(id: string, input: UpdateEmployeeRoleInput): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem atualizar movimentações de cargo"
      })
    }
    
    const supabase = await createClient()
    
    // Busca a movimentação existente
    const { data: existingRole, error: findError } = await supabase
      .from("employee_roles")
      .select("id, employee_id, company_id")
      .eq("id", id)
      .single()
    
    if (findError || !existingRole) {
      return constructServerResponse({
        success: false,
        error: "Movimentação de cargo não encontrada"
      })
    }
    
    // Verifica se pertence à empresa
    if (existingRole.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Movimentação de cargo não pertence à sua empresa"
      })
    }
    
    // Se marcado como cargo atual, atualiza os outros cargos
    if (input.is_current) {
      await supabase
        .from("employee_roles")
        .update({ 
          is_current: false,
          end_date: input.start_date
        })
        .eq("employee_id", existingRole.employee_id)
        .neq("id", id)
        .eq("is_current", true)
    }
    
    // Atualiza a movimentação
    const { data, error } = await supabase
      .from("employee_roles")
      .update(input)
      .eq("id", id)
      .select(`
        *,
        role:roles(*)
      `)
      .single()
    
    if (error) throw error
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${existingRole.employee_id}`)
    revalidatePath(`/dashboard/employees/${existingRole.employee_id}/movimentacoes`)
    
    return constructServerResponse({
      success: true,
      data,
      message: "Movimentação de cargo atualizada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar movimentação de cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar movimentação de cargo"
    })
  }
}

/**
 * Remove uma movimentação de cargo
 * @param id ID da movimentação
 * @returns Status da operação
 */
export async function deleteEmployeeRole(id: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem remover movimentações de cargo"
      })
    }
    
    const supabase = await createClient()
    
    // Busca a movimentação existente
    const { data: existingRole, error: findError } = await supabase
      .from("employee_roles")
      .select("id, employee_id, company_id, is_current")
      .eq("id", id)
      .single()
    
    if (findError || !existingRole) {
      return constructServerResponse({
        success: false,
        error: "Movimentação de cargo não encontrada"
      })
    }
    
    // Verifica se pertence à empresa
    if (existingRole.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Movimentação de cargo não pertence à sua empresa"
      })
    }
    
    // Remove a movimentação
    const { error } = await supabase
      .from("employee_roles")
      .delete()
      .eq("id", id)
    
    if (error) throw error
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${existingRole.employee_id}`)
    revalidatePath(`/dashboard/employees/${existingRole.employee_id}/movimentacoes`)
    
    return constructServerResponse({
      success: true,
      message: "Movimentação de cargo removida com sucesso"
    })
  } catch (error) {
    console.error("Erro ao remover movimentação de cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao remover movimentação de cargo"
    })
  }
} 