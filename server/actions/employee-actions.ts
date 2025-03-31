"use server"

/**
 * Server actions para gerenciamento de funcionários
 * Fornece ações do servidor para operações com funcionários
 */

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EmployeeFilters, EmployeeWithCompany, EmployeeWithRole, EmployeeInsert, EmployeeUpdate } from "@/lib/types/employees"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeCreateSchema, employeeUpdateSchema } from "@/lib/schemas/employee-schema"

/**
 * Obtém todos os funcionários da empresa atual
 * @returns Lista de funcionários
 */
export async function getEmployees() {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("employees")
      .select(`
        *,
        company:company_id (
          id,
          name,
          cnpj
        )
      `)
      .eq("company_id", company.id)
      .order("full_name", { ascending: true })
    
    if (error) {
      console.error("Erro na consulta:", error)
      throw error
    }
    
    return data as unknown as EmployeeWithCompany[]
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    throw new Error(`Não foi possível buscar os funcionários: ${JSON.stringify(error)}`)
  }
}

/**
 * Obtém um funcionário específico
 * @param employeeId ID do funcionário
 * @returns Funcionário
 */
export async function getEmployee(employeeId: string) {
  try {
    if (!employeeId) {
      throw new Error("ID do funcionário não fornecido")
    }
    
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca o funcionário com informações da empresa
    const { data: employee, error } = await supabase
      .from("employees")
      .select(`
        *,
        company:company_id (
          id,
          name,
          cnpj
        )
      `)
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (error) {
      console.error("Erro na consulta:", error)
      throw error
    }
    
    // Busca os cargos associados ao funcionário
    const { data: roles, error: rolesError } = await supabase
      .from("employee_roles")
      .select(`
        *,
        role:roles(*)
      `)
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })
    
    if (rolesError) {
      console.error("Erro ao buscar cargos:", rolesError)
    }
    
    return {
      ...employee,
      roles: roles || []
    }
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error)
    throw new Error(`Não foi possível buscar o funcionário: ${JSON.stringify(error)}`)
  }
}

/**
 * Cria um novo funcionário
 * @param formData Dados do formulário do funcionário
 */
export async function createEmployee(formData: FormData) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem criar funcionários")
    }
    
    const data = Object.fromEntries(formData.entries())
    
    // Adiciona o ID da empresa atual
    const employeeData = {
      ...data,
      company_id: company.id
    }
    
    // Valida os dados
    const validationResult = employeeCreateSchema.safeParse(employeeData)
    
    if (!validationResult.success) {
      console.error("Erro de validação:", validationResult.error.format())
      throw new Error(`Dados inválidos: ${JSON.stringify(validationResult.error.format())}`)
    }
    
    const supabase = await createClient()
    
    const { data: employee, error } = await supabase
      .from("employees")
      .insert(validationResult.data)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao criar funcionário:", error)
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/employees")
    
    return { success: true, employee }
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar funcionário" 
    }
  }
}

/**
 * Atualiza um funcionário existente
 * @param employeeId ID do funcionário
 * @param formData Dados do formulário do funcionário
 */
export async function updateEmployee(employeeId: string, formData: FormData) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar funcionários")
    }
    
    const data = Object.fromEntries(formData.entries())
    
    // Valida os dados
    const validationResult = employeeUpdateSchema.safeParse(data)
    
    if (!validationResult.success) {
      console.error("Erro de validação:", validationResult.error.format())
      throw new Error(`Dados inválidos: ${JSON.stringify(validationResult.error.format())}`)
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário existe e pertence à empresa atual
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (!existingEmployee) {
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
    }
    
    const { data: employee, error } = await supabase
      .from("employees")
      .update(validationResult.data)
      .eq("id", employeeId)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao atualizar funcionário:", error)
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/employees")
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return { success: true, employee }
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar funcionário" 
    }
  }
}

/**
 * Atualiza o status de um funcionário
 * @param employeeId ID do funcionário
 * @param status Novo status
 */
export async function updateEmployeeStatus(employeeId: string, status: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar o status de funcionários")
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário existe e pertence à empresa atual
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (!existingEmployee) {
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
    }
    
    const { data: employee, error } = await supabase
      .from("employees")
      .update({ status })
      .eq("id", employeeId)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao atualizar status do funcionário:", error)
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/employees")
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return { success: true, employee }
  } catch (error) {
    console.error("Erro ao atualizar status do funcionário:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar status do funcionário" 
    }
  }
}

/**
 * Remove um funcionário
 * @param employeeId ID do funcionário
 */
export async function deleteEmployee(employeeId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem remover funcionários")
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário existe e pertence à empresa atual
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (!existingEmployee) {
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
    }
    
    // Remove documentos relacionados ao funcionário
    await supabase.from("employee_documents").delete().eq("employee_id", employeeId)
    
    // Remove férias e ausências relacionadas ao funcionário
    await supabase.from("time_off").delete().eq("employee_id", employeeId)
    
    // Remove tarefas de onboarding relacionadas ao funcionário
    await supabase.from("employee_onboarding").delete().eq("employee_id", employeeId)
    
    // Remove movimentações de cargo relacionadas ao funcionário
    await supabase.from("employee_roles").delete().eq("employee_id", employeeId)
    
    // Remove o funcionário
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId)
    
    if (error) {
      console.error("Erro ao excluir funcionário:", error)
      throw error
    }
    
    // Revalida a página de listagem
    revalidatePath("/dashboard/employees")
    
    // Redireciona para a listagem após excluir
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao excluir funcionário" 
    }
  }
} 