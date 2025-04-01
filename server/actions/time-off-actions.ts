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
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"

/**
 * Obtém todas as solicitações de férias e ausências de um funcionário ou empresa
 * @param employeeId ID do funcionário (se null, busca de toda a empresa)
 * @returns Lista de solicitações
 */
export async function getTimeOffs(employeeId: string | null = null): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    // Se não for admin, só pode ver suas próprias solicitações
    if (employeeId && employeeId !== employee.id && !company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Sem permissão para ver solicitações de outros funcionários"
      })
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
    
    return constructServerResponse({
      success: true,
      data: data as unknown as TimeOffWithEmployee[],
      message: "Solicitações obtidas com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar as solicitações: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém uma solicitação específica
 * @param timeOffId ID da solicitação
 * @returns Detalhes da solicitação
 */
export async function getTimeOff(timeOffId: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!timeOffId) {
      return constructServerResponse({
        success: false,
        error: "ID da solicitação não fornecido"
      })
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
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    // Verificar se pertence à mesma empresa ou se é o próprio funcionário ou se é admin
    if (
      data.employees.company_id !== employee.company_id && 
      data.employee_id !== employee.id && 
      !company.isAdmin
    ) {
      return constructServerResponse({
        success: false,
        error: "Sem permissão para acessar esta solicitação"
      })
    }
    
    return constructServerResponse({
      success: true,
      data: data as unknown as TimeOffWithEmployee,
      message: "Solicitação obtida com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar a solicitação: ${error instanceof Error ? error.message : String(error)}`
    })
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
}): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o usuário é um funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    // Se não for admin, só pode criar solicitações para si mesmo
    if (data.employee_id !== employee.id && !company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Sem permissão para criar solicitações para outros funcionários"
      })
    }
    
    // Verificar se o funcionário pertence à empresa
    if (company.isAdmin && data.employee_id !== employee.id) {
      const { data: targetEmployee, error: targetError } = await supabase
        .from("employees")
        .select("id, company_id")
        .eq("id", data.employee_id)
        .eq("company_id", employee.company_id)
        .single()
      
      if (targetError || !targetEmployee) {
        return constructServerResponse({
          success: false,
          error: "Funcionário alvo não encontrado ou não pertence à sua empresa"
        })
      }
    }
    
    // Inserir a solicitação
    const timeOffData: TimeOffInsert = {
      employee_id: data.employee_id,
      type: data.type,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason,
      status: "pending",
      total_days: data.total_days
    }
    
    const { data: createdTimeOff, error } = await supabase
      .from("time_off")
      .insert(timeOffData)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Revalidar páginas
    revalidatePath("/dashboard/time-off")
    revalidatePath(`/dashboard/employees/${data.employee_id}`)
    
    return constructServerResponse({
      success: true,
      data: createdTimeOff as TimeOff,
      message: "Solicitação criada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao criar solicitação:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível criar a solicitação: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Atualiza o status de uma solicitação
 * @param id ID da solicitação
 * @param status Novo status
 * @returns Solicitação atualizada
 */
export async function updateTimeOffStatus(id: string, status: TimeOffStatus): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!id) {
      return constructServerResponse({
        success: false,
        error: "ID da solicitação não fornecido"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem aprovar/rejeitar solicitações"
      })
    }
    
    const supabase = await createClient()
    
    // Busca a solicitação
    const { data: timeOff, error: fetchError } = await supabase
      .from("time_off")
      .select("*, employees:employee_id(company_id)")
      .eq("id", id)
      .single()
    
    if (fetchError || !timeOff) {
      return constructServerResponse({
        success: false,
        error: "Solicitação não encontrada"
      })
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (!employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    // Verificar se pertence à mesma empresa
    if (timeOff.employees?.company_id !== employee.company_id) {
      return constructServerResponse({
        success: false,
        error: "Sem permissão para atualizar esta solicitação"
      })
    }
    
    // Atualizar o status
    const updateData: TimeOffUpdate = {
      status,
      approved_by: status === "approved" ? employee.id : null,
      approved_at: status === "approved" ? new Date().toISOString() : null
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
    
    // Revalidar páginas
    revalidatePath("/dashboard/time-off")
    revalidatePath(`/dashboard/employees/${timeOff.employee_id}`)
    
    return constructServerResponse({
      success: true,
      data: updatedTimeOff as TimeOff,
      message: status === "approved" 
        ? "Solicitação aprovada com sucesso" 
        : "Solicitação rejeitada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar status da solicitação:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível atualizar a solicitação: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Remove uma solicitação
 * @param id ID da solicitação
 * @returns Status da operação
 */
export async function deleteTimeOff(id: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!id) {
      return constructServerResponse({
        success: false,
        error: "ID da solicitação não fornecido"
      })
    }
    
    const supabase = await createClient()
    
    // Busca a solicitação
    const { data: timeOff, error: fetchError } = await supabase
      .from("time_off")
      .select(`
        id,
        employee_id, 
        status, 
        employees:employee_id (
          id,
          company_id
        )
      `)
      .eq("id", id)
      .single()
    
    if (fetchError || !timeOff) {
      return constructServerResponse({
        success: false,
        error: "Solicitação não encontrada"
      })
    }
    
    // Obtém o usuário
    const { data: employee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("user_id", company.userId)
      .single()
    
    if (!employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    // Verifica permissão: admin pode excluir qualquer solicitação da empresa,
    // funcionário comum só pode excluir suas próprias solicitações pendentes
    if (!company.isAdmin) {
      if (timeOff.employee_id !== employee.id) {
        return constructServerResponse({
          success: false,
          error: "Sem permissão para excluir solicitações de outros funcionários"
        })
      }
      
      if (timeOff.status !== "pending") {
        return constructServerResponse({
          success: false,
          error: "Somente solicitações pendentes podem ser excluídas"
        })
      }
    } else {
      // Verifica se pertence à mesma empresa (para admin)
      // Obtenha a company_id do funcionário associado à solicitação
      const { data: timeOffEmployee } = await supabase
        .from("employees")
        .select("company_id")
        .eq("id", timeOff.employee_id)
        .single()
        
      if (!timeOffEmployee || timeOffEmployee.company_id !== employee.company_id) {
        return constructServerResponse({
          success: false,
          error: "Sem permissão para excluir esta solicitação"
        })
      }
    }
    
    // Exclui a solicitação
    const { error } = await supabase
      .from("time_off")
      .delete()
      .eq("id", id)
    
    if (error) {
      throw error
    }
    
    // Revalidar páginas
    revalidatePath("/dashboard/time-off")
    revalidatePath(`/dashboard/employees/${timeOff.employee_id}`)
    
    return constructServerResponse({
      success: true,
      message: "Solicitação excluída com sucesso"
    })
  } catch (error) {
    console.error("Erro ao excluir solicitação:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível excluir a solicitação: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Verifica se um funcionário está em férias atualmente
 * @param employeeId ID do funcionário
 * @returns true se estiver em férias
 */
export async function isEmployeeOnTimeOff(employeeId: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!employeeId) {
      return constructServerResponse({
        success: false,
        error: "ID do funcionário não fornecido"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa
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
    
    const today = new Date().toISOString().split('T')[0]
    
    // Busca solicitações aprovadas que incluem a data atual
    const { data } = await supabase
      .from("time_off")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("status", "approved")
      .lte("start_date", today)
      .gte("end_date", today)
    
    const isOnTimeOff = data && data.length > 0
    
    return constructServerResponse({
      success: true,
      data: isOnTimeOff,
      message: isOnTimeOff ? "Funcionário está em férias/ausência" : "Funcionário não está em férias/ausência"
    })
  } catch (error) {
    console.error("Erro ao verificar status de férias:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível verificar o status: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém a lista de funcionários para o seletor
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
    
    // Obtém os funcionários da empresa
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("company_id", company.id)
      .order("full_name")
    
    if (error) {
      throw error
    }
    
    return constructServerResponse({
      success: true,
      data,
      message: "Funcionários obtidos com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar funcionários: ${error instanceof Error ? error.message : String(error)}`
    })
  }
} 