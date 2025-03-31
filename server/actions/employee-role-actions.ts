"use server"

/**
 * Server actions para gerenciamento de movimentações de cargos
 * Fornece ações do servidor para operações com movimentações de cargos
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { CreateEmployeeRoleInput, UpdateEmployeeRoleInput } from "@/lib/types/employee-role"

/**
 * Obtém todas as movimentações de cargo de um funcionário
 * @param employeeId ID do funcionário
 */
export async function getEmployeeRoles(employeeId: string) {
  try {
    if (!employeeId) {
      throw new Error("ID do funcionário não fornecido")
    }
    
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
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
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
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
    
    return data
  } catch (error) {
    console.error("Erro ao buscar movimentações de cargo:", error)
    throw new Error(`Não foi possível buscar as movimentações de cargo: ${JSON.stringify(error)}`)
  }
}

/**
 * Obtém o cargo atual de um funcionário
 * @param employeeId ID do funcionário
 */
export async function getCurrentRole(employeeId: string) {
  try {
    if (!employeeId) {
      throw new Error("ID do funcionário não fornecido")
    }
    
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
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
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
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
    
    return data
  } catch (error) {
    console.error("Erro ao buscar cargo atual:", error)
    return null
  }
}

/**
 * Cria uma nova movimentação de cargo
 * @param input Dados da movimentação
 */
export async function createEmployeeRole(input: CreateEmployeeRoleInput) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem registrar movimentações de cargo")
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
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
    }
    
    // Verifica se o cargo pertence à empresa atual
    const { data: role } = await supabase
      .from("roles")
      .select("id, company_id")
      .eq("id", input.role_id)
      .eq("company_id", company.id)
      .single()
    
    if (!role) {
      throw new Error("Cargo não encontrado ou não pertence à sua empresa")
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
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao criar movimentação de cargo:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar movimentação de cargo" 
    }
  }
}

/**
 * Atualiza uma movimentação de cargo existente
 * @param id ID da movimentação
 * @param input Dados atualizados
 */
export async function updateEmployeeRole(id: string, input: UpdateEmployeeRoleInput) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar movimentações de cargo")
    }
    
    const supabase = await createClient()
    
    // Verifica se a movimentação existe e pertence à empresa atual
    const { data: existingRole } = await supabase
      .from("employee_roles")
      .select("id, employee_id, company_id")
      .eq("id", id)
      .eq("company_id", company.id)
      .single()
    
    if (!existingRole) {
      throw new Error("Movimentação não encontrada ou não pertence à sua empresa")
    }
    
    // Se houver mudança em cargo, verifica se o novo cargo pertence à empresa
    if (input.role_id) {
      const { data: role } = await supabase
        .from("roles")
        .select("id, company_id")
        .eq("id", input.role_id)
        .eq("company_id", company.id)
        .single()
      
      if (!role) {
        throw new Error("Cargo não encontrado ou não pertence à sua empresa")
      }
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
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atualizar movimentação de cargo:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar movimentação de cargo" 
    }
  }
}

/**
 * Remove uma movimentação de cargo
 * @param id ID da movimentação
 */
export async function deleteEmployeeRole(id: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem remover movimentações de cargo")
    }
    
    const supabase = await createClient()
    
    // Verifica se a movimentação existe e pertence à empresa atual
    const { data: existingRole } = await supabase
      .from("employee_roles")
      .select("id, employee_id, company_id, is_current")
      .eq("id", id)
      .eq("company_id", company.id)
      .single()
    
    if (!existingRole) {
      throw new Error("Movimentação não encontrada ou não pertence à sua empresa")
    }
    
    // Remove a movimentação
    const { error } = await supabase
      .from("employee_roles")
      .delete()
      .eq("id", id)
    
    if (error) throw error
    
    // Se era o cargo atual, precisa definir um novo cargo atual
    if (existingRole.is_current) {
      // Busca a movimentação mais recente para defini-la como atual
      const { data: latestRole } = await supabase
        .from("employee_roles")
        .select("id")
        .eq("employee_id", existingRole.employee_id)
        .order("start_date", { ascending: false })
        .limit(1)
        .single()
      
      if (latestRole) {
        await supabase
          .from("employee_roles")
          .update({ is_current: true, end_date: null })
          .eq("id", latestRole.id)
      }
    }
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${existingRole.employee_id}`)
    revalidatePath(`/dashboard/employees/${existingRole.employee_id}/movimentacoes`)
    
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir movimentação de cargo:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao excluir movimentação de cargo" 
    }
  }
} 