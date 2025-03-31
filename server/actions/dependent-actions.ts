"use server"

/**
 * Server actions para gerenciar dependentes
 * Fornece funções para listar, criar, atualizar e excluir dependentes de funcionários
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { 
  EmployeeDependent, 
  EmployeeDependentInsert, 
  EmployeeDependentUpdate 
} from "@/lib/types/documents"
import { dependentCreateSchema, dependentUpdateSchema } from "@/lib/schemas/dependent-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"

/**
 * Obtém todos os dependentes de um funcionário
 * @param employeeId ID do funcionário
 * @returns Lista de dependentes
 */
export async function getDependents(employeeId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa do usuário atual
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
      .from("employee_dependents")
      .select("*")
      .eq("employee_id", employeeId)
      .order("full_name")
    
    if (error) {
      throw error
    }
    
    return { success: true, dependents: data as EmployeeDependent[] }
  } catch (error) {
    console.error("Erro ao buscar dependentes:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar dependentes" 
    }
  }
}

/**
 * Obtém um dependente específico
 * @param dependentId ID do dependente
 * @returns Dados do dependente
 */
export async function getDependent(dependentId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca o dependente e verifica através de join se pertence à empresa
    const { data, error } = await supabase
      .from("employee_dependents")
      .select(`
        *,
        employees!inner(company_id)
      `)
      .eq("id", dependentId)
      .eq("employees.company_id", company.id)
      .single()
    
    if (error) {
      throw error
    }
    
    if (!data) {
      throw new Error("Dependente não encontrado ou não pertence à sua empresa")
    }
    
    // Remove o join da resposta
    const { employees, ...dependent } = data
    
    return { success: true, dependent: dependent as unknown as EmployeeDependent }
  } catch (error) {
    console.error("Erro ao buscar dependente:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar dependente" 
    }
  }
}

/**
 * Cria um novo dependente
 * @param formData Dados do formulário do dependente
 */
export async function createDependent(formData: FormData) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem criar dependentes")
    }
    
    const data = Object.fromEntries(formData.entries()) as Record<string, any>
    
    // Converte valores booleanos do form data
    data.has_disability = data.has_disability === "on" || data.has_disability === "true"
    data.is_student = data.is_student === "on" || data.is_student === "true"
    
    // Valida os dados
    const validationResult = dependentCreateSchema.safeParse(data)
    
    if (!validationResult.success) {
      console.error("Erro de validação:", validationResult.error.format())
      throw new Error(`Dados inválidos: ${JSON.stringify(validationResult.error.format())}`)
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa do usuário atual
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", validationResult.data.employee_id)
      .eq("company_id", company.id)
      .single()
    
    if (!employee) {
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
    }
    
    // Insere o dependente
    const { data: dependent, error } = await supabase
      .from("employee_dependents")
      .insert(validationResult.data)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${employee.id}`)
    
    return { success: true, dependent: dependent as EmployeeDependent }
  } catch (error) {
    console.error("Erro ao criar dependente:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar dependente" 
    }
  }
}

/**
 * Cria múltiplos dependentes para um funcionário
 * @param employeeId ID do funcionário
 * @param dependents Lista de dependentes
 */
export async function createDependentsBatch(employeeId: string, dependents: EmployeeDependentInsert[]) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem criar dependentes")
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa do usuário atual
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (!employee) {
      throw new Error("Funcionário não encontrado ou não pertence à sua empresa")
    }
    
    // Verifica se todos os dependentes pertencem ao mesmo funcionário
    if (dependents.some(d => d.employee_id !== employeeId)) {
      throw new Error("Todos os dependentes devem pertencer ao mesmo funcionário")
    }
    
    // Insere os dependentes
    const { data, error } = await supabase
      .from("employee_dependents")
      .insert(dependents)
      .select()
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return { success: true, dependents: data as EmployeeDependent[] }
  } catch (error) {
    console.error("Erro ao criar dependentes:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar dependentes" 
    }
  }
}

/**
 * Atualiza um dependente existente
 * @param dependentId ID do dependente
 * @param formData Dados do formulário do dependente
 */
export async function updateDependent(dependentId: string, formData: FormData) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar dependentes")
    }
    
    const data = Object.fromEntries(formData.entries()) as Record<string, any>
    
    // Converte valores booleanos do form data
    data.has_disability = data.has_disability === "on" || data.has_disability === "true"
    data.is_student = data.is_student === "on" || data.is_student === "true"
    
    // Valida os dados
    const validationResult = dependentUpdateSchema.safeParse(data)
    
    if (!validationResult.success) {
      console.error("Erro de validação:", validationResult.error.format())
      throw new Error(`Dados inválidos: ${JSON.stringify(validationResult.error.format())}`)
    }
    
    const supabase = await createClient()
    
    // Busca o dependente para verificar se pertence à empresa
    const { data: dependentData } = await supabase
      .from("employee_dependents")
      .select(`
        *,
        employees!inner(id, company_id)
      `)
      .eq("id", dependentId)
      .eq("employees.company_id", company.id)
      .single()
    
    if (!dependentData) {
      throw new Error("Dependente não encontrado ou não pertence à sua empresa")
    }
    
    // Atualiza o dependente
    const { data: updatedDependent, error } = await supabase
      .from("employee_dependents")
      .update(validationResult.data)
      .eq("id", dependentId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas relevantes
    const employeeId = (dependentData.employees as any).id
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return { success: true, dependent: updatedDependent as EmployeeDependent }
  } catch (error) {
    console.error("Erro ao atualizar dependente:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar dependente" 
    }
  }
}

/**
 * Remove um dependente
 * @param dependentId ID do dependente
 */
export async function deleteDependent(dependentId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem excluir dependentes")
    }
    
    const supabase = await createClient()
    
    // Busca o dependente para verificar se pertence à empresa
    const { data: dependent } = await supabase
      .from("employee_dependents")
      .select(`
        *,
        employees!inner(id, company_id)
      `)
      .eq("id", dependentId)
      .eq("employees.company_id", company.id)
      .single()
    
    if (!dependent) {
      throw new Error("Dependente não encontrado ou não pertence à sua empresa")
    }
    
    // Remove o dependente
    const { error } = await supabase
      .from("employee_dependents")
      .delete()
      .eq("id", dependentId)
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas relevantes
    const employeeId = (dependent.employees as any).id
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir dependente:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao excluir dependente" 
    }
  }
} 