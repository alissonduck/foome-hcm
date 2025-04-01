/**
 * Tipos para férias e ausências (time-off)
 * Define os tipos utilizados para gerenciar férias e ausências de funcionários
 */

import type { Database } from "../supabase/types"

// Tipo base para time-off
export type TimeOff = Database["public"]["Tables"]["time_off"]["Row"]
export type TimeOffInsert = Database["public"]["Tables"]["time_off"]["Insert"]
export type TimeOffUpdate = Database["public"]["Tables"]["time_off"]["Update"]

// Tipo estendido com dados do funcionário e aprovador
export interface TimeOffWithEmployee {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  reason: string
  type: string
  status: string
  total_days: number
  created_at?: string
  approved_by?: string
  approved_at?: string
  employees?: {
    id: string
    full_name: string
    email?: string
  }
  approver?: {
    full_name: string
  }
}

// Status para time-off
export type TimeOffStatus = "pending" | "approved" | "rejected"

// Tipos de time-off disponíveis
export type TimeOffType = 
  | "vacation" 
  | "sick_leave" 
  | "maternity_leave" 
  | "paternity_leave" 
  | "bereavement" 
  | "personal" 
  | "other"

// Filtros para listagem de time-off
export interface TimeOffFilters {
  employeeId?: string
  status?: string
  type?: string
  search?: string
}

// Dados para criar novo time-off
export interface TimeOffCreateData {
  employeeId: string
  type: TimeOffType
  startDate: string
  endDate: string
  reason: string
}

// Dados para atualizar status do time-off
export interface TimeOffStatusUpdateData {
  timeOffId: string
  status: TimeOffStatus
  approvedBy: string
} 