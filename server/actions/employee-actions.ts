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
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"

/**
 * Obtém todos os funcionários da empresa atual
 * @returns Lista de funcionários
 */
export async function getEmployees(): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
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
    
    return constructServerResponse({
      success: true,
      data: data as unknown as EmployeeWithCompany[],
      message: "Funcionários obtidos com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar os funcionários: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém um funcionário específico
 * @param employeeId ID do funcionário
 * @returns Funcionário
 */
export async function getEmployee(employeeId: string): Promise<ServerResponse> {
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
    
    return constructServerResponse({
      success: true,
      data: {
        ...employee,
        roles: roles || []
      },
      message: "Funcionário obtido com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar o funcionário: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Cria um novo funcionário
 * @param formData Dados do formulário do funcionário
 */
export async function createEmployee(formData: FormData): Promise<ServerResponse> {
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
        error: "Apenas administradores podem criar funcionários"
      })
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
      return constructServerResponse({
        success: false,
        error: `Dados inválidos: ${JSON.stringify(validationResult.error.format())}`
      })
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
    
    return constructServerResponse({
      success: true,
      data: employee,
      message: "Funcionário criado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao criar funcionário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar funcionário"
    })
  }
}

/**
 * Atualiza um funcionário existente
 * @param employeeId ID do funcionário
 * @param formData Dados do formulário do funcionário
 */
export async function updateEmployee(employeeId: string, formData: FormData): Promise<ServerResponse> {
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
        error: "Apenas administradores podem atualizar funcionários"
      })
    }
    
    const data = Object.fromEntries(formData.entries())
    
    // Valida os dados
    const validationResult = employeeUpdateSchema.safeParse(data)
    
    if (!validationResult.success) {
      console.error("Erro de validação:", validationResult.error.format())
      return constructServerResponse({
        success: false,
        error: `Dados inválidos: ${JSON.stringify(validationResult.error.format())}`
      })
    }
    
    const supabase = await createClient()
    
    // Confirma que o funcionário existe e pertence à empresa
    const { data: existingEmployee, error: findError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (findError || !existingEmployee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      })
    }
    
    const { data: updated, error } = await supabase
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
    
    return constructServerResponse({
      success: true,
      data: updated,
      message: "Funcionário atualizado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar funcionário"
    })
  }
}

/**
 * Atualiza o status de um funcionário
 * @param employeeId ID do funcionário
 * @param status Novo status
 */
export async function updateEmployeeStatus(employeeId: string, status: string): Promise<ServerResponse> {
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
        error: "Apenas administradores podem atualizar o status de funcionários"
      })
    }
    
    const supabase = await createClient()
    
    // Confirma que o funcionário existe e pertence à empresa
    const { data: existingEmployee, error: findError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (findError || !existingEmployee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      })
    }
    
    const { data: updated, error } = await supabase
      .from("employees")
      .update({ status })
      .eq("id", employeeId)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao atualizar status:", error)
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/employees")
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return constructServerResponse({
      success: true,
      data: updated,
      message: "Status do funcionário atualizado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar status"
    })
  }
}

/**
 * Remove um funcionário
 * @param employeeId ID do funcionário
 */
export async function deleteEmployee(employeeId: string): Promise<ServerResponse> {
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
        error: "Apenas administradores podem remover funcionários"
      })
    }
    
    const supabase = await createClient()
    
    // Confirma que o funcionário existe e pertence à empresa
    const { data: existingEmployee, error: findError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .eq("company_id", company.id)
      .single()
    
    if (findError || !existingEmployee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado ou não pertence à sua empresa"
      })
    }
    
    // Remove o funcionário
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId)
    
    if (error) {
      console.error("Erro ao remover funcionário:", error)
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/employees")
    
    return constructServerResponse({
      success: true,
      message: "Funcionário removido com sucesso"
    })
  } catch (error) {
    console.error("Erro ao remover funcionário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao remover funcionário"
    })
  }
} 