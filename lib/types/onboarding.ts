/**
 * Definição de tipos para Onboarding
 */

import { Database } from "@/lib/supabase/types"

// Tipos básicos do banco de dados
export type OnboardingTask = Database["public"]["Tables"]["onboarding_tasks"]["Row"]
export type OnboardingTaskInsert = Database["public"]["Tables"]["onboarding_tasks"]["Insert"]
export type OnboardingTaskUpdate = Database["public"]["Tables"]["onboarding_tasks"]["Update"]

export type EmployeeOnboarding = Database["public"]["Tables"]["employee_onboarding"]["Row"]
export type EmployeeOnboardingInsert = Database["public"]["Tables"]["employee_onboarding"]["Insert"]
export type EmployeeOnboardingUpdate = Database["public"]["Tables"]["employee_onboarding"]["Update"]

// Categorias de tarefas de onboarding
export const ONBOARDING_TASK_CATEGORIES = [
  "documentation",
  "training",
  "system_access",
  "equipment",
  "introduction", 
  "other"
] as const

export type OnboardingTaskCategory = typeof ONBOARDING_TASK_CATEGORIES[number]

// Status das tarefas de onboarding
export const ONBOARDING_STATUSES = [
  "pending",
  "completed"
] as const

export type OnboardingStatus = typeof ONBOARDING_STATUSES[number]

// Tipo para onboarding com relacionamentos
export interface EmployeeOnboardingWithRelations {
  id: string
  employee_id: string
  task_id: string
  status: string
  due_date: string | null
  notes: string | null
  completed_at: string | null
  completed_by: string | null
  created_at: string | null
  updated_at: string | null
  employees?: {
    id: string
    full_name: string
  }
  onboarding_tasks?: {
    id: string
    name: string
    description: string | null
    category: string | null
    is_required: boolean | null
  }
  completed_by_employee?: {
    full_name: string
  } | null
}

// Filtros para busca de onboardings
export interface OnboardingFilters {
  status?: OnboardingStatus
  employeeId?: string
  search?: string
} 