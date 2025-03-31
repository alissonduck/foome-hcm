/**
 * Serviço para gerenciamento de férias e ausências
 * Fornece métodos para interagir com a tabela time_off
 */

import { createClient } from "@/lib/supabase/server"
import type { 
  TimeOff, 
  TimeOffInsert, 
  TimeOffUpdate, 
  TimeOffWithEmployee,
  TimeOffStatus,
  TimeOffFilters
} from "@/lib/types/time-off"

export class TimeOffService {
  /**
   * Obtém todas as solicitações de férias e ausências de um funcionário ou empresa
   * @param employeeId ID do funcionário (se null, busca de toda a empresa)
   * @param companyId ID da empresa
   * @returns Lista de solicitações
   */
  static async getTimeOffs(employeeId: string | null, companyId: string): Promise<TimeOffWithEmployee[]> {
    try {
      if (!companyId) {
        console.warn("ID da empresa não fornecido")
        return []
      }

      const supabase = await createClient()
      
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
      if (employeeId) {
        query = query.eq("employee_id", employeeId)
      } else {
        // Primeiro obtém os IDs dos funcionários da empresa
        const { data: employeeIds } = await supabase
          .from("employees")
          .select("id")
          .eq("company_id", companyId)
        
        if (employeeIds && employeeIds.length > 0) {
          // Filtra as solicitações pelos IDs dos funcionários
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
      throw new Error(`Não foi possível buscar as solicitações: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Obtém uma solicitação específica
   * @param timeOffId ID da solicitação
   * @returns Detalhes da solicitação
   */
  static async getTimeOff(timeOffId: string): Promise<TimeOffWithEmployee> {
    try {
      if (!timeOffId) {
        throw new Error("ID da solicitação não fornecido")
      }

      const supabase = await createClient()
      
      const { data, error } = await supabase
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
        .eq("id", timeOffId)
        .single()
      
      if (error) {
        console.error("Erro na consulta:", error)
        throw error
      }
      
      return data as unknown as TimeOffWithEmployee
    } catch (error) {
      console.error("Erro ao buscar solicitação:", error)
      throw new Error(`Não foi possível buscar a solicitação: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Cria uma nova solicitação
   * @param timeOff Dados da solicitação
   * @returns Solicitação criada
   */
  static async createTimeOff(timeOff: TimeOffInsert): Promise<TimeOff> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("time_off")
        .insert(timeOff)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao criar solicitação:", error)
      throw new Error("Não foi possível criar a solicitação")
    }
  }
  
  /**
   * Atualiza o status de uma solicitação
   * @param id ID da solicitação
   * @param status Novo status
   * @param approvedBy ID do funcionário que aprovou/rejeitou
   * @returns Solicitação atualizada
   */
  static async updateTimeOffStatus(id: string, status: TimeOffStatus, approvedBy: string): Promise<TimeOff> {
    try {
      const supabase = await createClient()
      
      const updateData: TimeOffUpdate = {
        status,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from("time_off")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar status da solicitação:", error)
      throw new Error("Não foi possível atualizar o status da solicitação")
    }
  }
  
  /**
   * Remove uma solicitação
   * @param id ID da solicitação
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async deleteTimeOff(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("time_off")
        .delete()
        .eq("id", id)
      
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error)
      throw new Error("Não foi possível excluir a solicitação")
    }
  }
  
  /**
   * Filtra solicitações com base em critérios
   * @param timeOffs Lista de solicitações
   * @param filters Filtros a serem aplicados
   * @returns Lista filtrada de solicitações
   */
  static filterTimeOffs(timeOffs: TimeOffWithEmployee[], filters: TimeOffFilters): TimeOffWithEmployee[] {
    return timeOffs.filter(timeOff => {
      // Filtro por funcionário
      if (filters.employeeId && filters.employeeId !== "all" && timeOff.employee_id !== filters.employeeId) {
        return false
      }
      
      // Filtro por status
      if (filters.status && filters.status !== "all" && timeOff.status !== filters.status) {
        return false
      }
      
      // Filtro por tipo
      if (filters.type && filters.type !== "all" && timeOff.type !== filters.type) {
        return false
      }
      
      // Filtro por busca (motivo ou nome do funcionário)
      if (filters.search) {
        const query = filters.search.toLowerCase()
        return (
          (timeOff.reason && timeOff.reason.toLowerCase().includes(query)) ||
          (timeOff.employees?.full_name && timeOff.employees.full_name.toLowerCase().includes(query))
        )
      }
      
      return true
    })
  }

  /**
   * Verifica se um funcionário está de férias ou em licença
   * @param employeeId ID do funcionário
   * @returns Verdadeiro se o funcionário estiver de férias ou em licença
   */
  static async isEmployeeOnTimeOff(employeeId: string): Promise<boolean> {
    try {
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
      
      return data && data.length > 0
    } catch (error) {
      console.error("Erro ao verificar status de férias:", error)
      return false
    }
  }
  
  /**
   * Atualiza o status do funcionário para "vacation" quando em férias
   * @param employeeId ID do funcionário
   * @param isOnVacation Indica se o funcionário está de férias
   * @returns Verdadeiro se a atualização for bem-sucedida
   */
  static async updateEmployeeVacationStatus(employeeId: string, isOnVacation: boolean): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("employees")
        .update({ 
          status: isOnVacation ? "vacation" : "active"
        })
        .eq("id", employeeId)
      
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao atualizar status de férias do funcionário:", error)
      return false
    }
  }
} 