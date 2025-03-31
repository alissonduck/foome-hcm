"use server"

/**
 * Server actions para gerenciamento de férias e ausências
 * Fornece ações do servidor para operações com férias e ausências
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import type { 
  TimeOff, 
  TimeOffInsert, 
  TimeOffUpdate, 
  TimeOffWithEmployee,
  TimeOffStatus,
  TimeOffFilters
} from "@/lib/types/time-off"

/**
 * Obtém todas as solicitações de férias e ausências de um funcionário ou empresa
 * @param employeeId ID do funcionário (se null, busca de toda a empresa)
 * @returns Lista de solicitações
 */
export async function getTimeOffs(employeeId: string | null = null): Promise<TimeOffWithEmployee[]> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    // Se não for admin, só pode ver suas próprias solicitações
    if (employeeId && employeeId !== employee.id && !company.isAdmin) {
      throw new Error("Sem permissão para ver solicitações de outros funcionários")
    }
    
    // Define o ID do funcionário para filtrar (null para admins verem todos)
    const filterEmployeeId = employeeId || (company.isAdmin ? null : employee.id)
    
    // Monta a consulta
    let query = supabase
      .from("time_off")
      .select(`
        *,
        employees:employee_id (
          id, 
          full_name,
          email
        ),
        approver:approved_by (
          full_name
        )
      `)
    
    // Se for um funcionário específico
    if (filterEmployeeId) {
      query = query.eq("employee_id", filterEmployeeId)
    } else {
      // Para administradores que querem ver todos, filtra pela empresa
      const { data: employeeIds } = await supabase
        .from("employees")
        .select("id")
        .eq("company_id", employee.company_id)
      
      if (employeeIds && employeeIds.length > 0) {
        // Filtra as solicitações pelos IDs dos funcionários da empresa
        query = query.in("employee_id", employeeIds.map(e => e.id))
      }
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) {
      console.error("Erro na consulta:", error)
      throw error
    }
    
    return data as unknown as TimeOffWithEmployee[]
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error)
    throw new Error(`Não foi possível buscar as solicitações: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém uma solicitação específica
 * @param timeOffId ID da solicitação
 * @returns Detalhes da solicitação
 */
export async function getTimeOff(timeOffId: string): Promise<TimeOffWithEmployee> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!timeOffId) {
      throw new Error("ID da solicitação não fornecido")
    }
    
    const supabase = await createClient()
    
    // Busca a solicitação
    const { data, error } = await supabase
      .from("time_off")
      .select(`
        *,
        employees:employee_id (
          id, 
          full_name,
          email,
          company_id
        ),
        approver:approved_by (
          full_name
        )
      `)
      .eq("id", timeOffId)
      .single()
    
    if (error) {
      console.error("Erro na consulta:", error)
      throw error
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (!employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    // Verificar se pertence à mesma empresa ou se é o próprio funcionário ou se é admin
    if (
      data.employees.company_id !== employee.company_id && 
      data.employee_id !== employee.id && 
      !company.isAdmin
    ) {
      throw new Error("Sem permissão para acessar esta solicitação")
    }
    
    return data as unknown as TimeOffWithEmployee
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error)
    throw new Error(`Não foi possível buscar a solicitação: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Cria uma nova solicitação
 * @param timeOff Dados da solicitação
 * @returns Solicitação criada
 */
export async function createTimeOff(data: {
  employee_id: string
  type: string
  start_date: string
  end_date: string
  reason: string
  total_days: number
}): Promise<TimeOff> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    // Se não for admin, só pode criar solicitações para si mesmo
    if (data.employee_id !== employee.id && !company.isAdmin) {
      throw new Error("Sem permissão para criar solicitações para outros funcionários")
    }
    
    // Verifica se o funcionário alvo pertence à empresa correta
    if (data.employee_id !== employee.id) {
      const { data: targetEmployee, error: targetError } = await supabase
        .from("employees")
        .select("company_id")
        .eq("id", data.employee_id)
        .single()
      
      if (targetError || !targetEmployee) {
        throw new Error("Funcionário alvo não encontrado")
      }
      
      if (targetEmployee.company_id !== employee.company_id) {
        throw new Error("Funcionário alvo não pertence à sua empresa")
      }
    }
    
    // Prepara os dados da solicitação
    const timeOff: TimeOffInsert = {
      employee_id: data.employee_id,
      type: data.type,
      status: "pending",
      reason: data.reason,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: data.total_days,
      created_at: new Date().toISOString()
    }
    
    // Cria a solicitação
    const { data: createdTimeOff, error } = await supabase
      .from("time_off")
      .insert(timeOff)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/time-off")
    
    return createdTimeOff
  } catch (error) {
    console.error("Erro ao criar solicitação:", error)
    throw new Error(`Não foi possível criar a solicitação: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Atualiza o status de uma solicitação
 * @param id ID da solicitação
 * @param status Novo status
 * @returns Solicitação atualizada
 */
export async function updateTimeOffStatus(id: string, status: TimeOffStatus): Promise<TimeOff> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    // Apenas administradores podem aprovar/rejeitar solicitações
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar o status de solicitações")
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    // Verifica se a solicitação existe e pertence à mesma empresa
    const { data: timeOff, error: timeOffError } = await supabase
      .from("time_off")
      .select(`*, employees:employee_id(company_id)`)
      .eq("id", id)
      .single()
    
    if (timeOffError || !timeOff) {
      throw new Error("Solicitação não encontrada")
    }
    
    const isSameCompany = timeOff.employees[0]?.company_id === employee.company_id
    
    if (!isSameCompany) {
      throw new Error("Sem permissão para atualizar esta solicitação")
    }
    
    // Atualiza o status
    const updateData: TimeOffUpdate = {
      status,
      approved_by: employee.id,
      approved_at: new Date().toISOString()
    }
    
    const { data: updatedTimeOff, error } = await supabase
      .from("time_off")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Se foi aprovada e é férias, atualiza o status do funcionário
    if (status === "approved" && timeOff.type === "vacation") {
      const { error: updateError } = await supabase
        .from("employees")
        .update({ status: "vacation" })
        .eq("id", timeOff.employee_id)
      
      if (updateError) {
        console.error("Erro ao atualizar status do funcionário:", updateError)
      }
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/time-off")
    
    return updatedTimeOff
  } catch (error) {
    console.error("Erro ao atualizar status da solicitação:", error)
    throw new Error(`Não foi possível atualizar o status da solicitação: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Remove uma solicitação
 * @param id ID da solicitação
 * @returns Verdadeiro se a remoção for bem-sucedida
 */
export async function deleteTimeOff(id: string): Promise<boolean> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    // Verifica se a solicitação existe e se o usuário tem permissão
    const { data: timeOff, error: timeOffError } = await supabase
      .from("time_off")
      .select("employee_id, status, employees:employee_id(company_id)")
      .eq("id", id)
      .single()
    
    if (timeOffError || !timeOff) {
      throw new Error("Solicitação não encontrada")
    }
    
    // Verificar se é administrador, ou se a solicitação pertence ao usuário e está pendente
    const isOwnRequest = timeOff.employee_id === employee.id
    const isPending = timeOff.status === "pending"
    const isSameCompany = timeOff.employees[0]?.company_id === employee.company_id
    
    if ((!company.isAdmin && !isOwnRequest) || (!company.isAdmin && !isPending) || !isSameCompany) {
      throw new Error("Sem permissão para excluir esta solicitação")
    }
    
    // Remove a solicitação
    const { error } = await supabase
      .from("time_off")
      .delete()
      .eq("id", id)
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/time-off")
    
    return true
  } catch (error) {
    console.error("Erro ao excluir solicitação:", error)
    throw new Error(`Não foi possível excluir a solicitação: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Verifica se um funcionário está de férias ou em licença
 * @param employeeId ID do funcionário
 * @returns Verdadeiro se o funcionário estiver de férias ou em licença
 */
export async function isEmployeeOnTimeOff(employeeId: string): Promise<boolean> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from("time_off")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("status", "approved")
      .lte("start_date", today)
      .gte("end_date", today)
      .limit(1)
    
    if (error) {
      throw error
    }
    
    return data.length > 0
  } catch (error) {
    console.error("Erro ao verificar status do funcionário:", error)
    return false
  }
}

/**
 * Obtém todos os funcionários da empresa
 * @returns Lista de funcionários
 */
export async function getEmployees(): Promise<{ id: string, full_name: string }[]> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    // Busca todos os funcionários da empresa
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("company_id", employee.company_id)
      .order("full_name")
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    throw new Error(`Não foi possível buscar os funcionários: ${error instanceof Error ? error.message : String(error)}`)
  }
} 