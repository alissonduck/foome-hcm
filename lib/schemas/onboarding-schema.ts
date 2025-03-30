/**
 * Schemas de validação para Onboarding
 */
import { z } from "zod"
import { ONBOARDING_TASK_CATEGORIES, ONBOARDING_STATUSES } from "@/lib/types/onboarding"

/**
 * Schema para criação de tarefa de onboarding
 */
export const onboardingTaskCreateSchema = z.object({
  company_id: z.string().uuid({ message: "ID da empresa inválido" }),
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  description: z.string().optional().nullable(),
  category: z.enum([...ONBOARDING_TASK_CATEGORIES] as [string, ...string[]]),
  is_required: z.boolean().default(true),
  default_due_days: z.number().int().min(1, { message: "Prazo deve ser de pelo menos 1 dia" }).default(7)
})

/**
 * Schema para atualização de tarefa de onboarding
 */
export const onboardingTaskUpdateSchema = onboardingTaskCreateSchema.partial()

/**
 * Schema para atribuição de tarefa de onboarding
 */
export const onboardingAssignSchema = z.object({
  employee_id: z.string().uuid({ message: "ID do funcionário inválido" }),
  task_ids: z.array(z.string().uuid({ message: "ID da tarefa inválido" })).min(1, { 
    message: "Selecione pelo menos uma tarefa"
  }),
  notes: z.string().optional().nullable(),
  due_date: z.string().optional().nullable()
})

/**
 * Schema para atualização de status de uma tarefa de onboarding
 */
export const onboardingStatusUpdateSchema = z.object({
  status: z.enum([...ONBOARDING_STATUSES] as [string, ...string[]]),
  completed_by: z.string().uuid().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

/**
 * Schema para filtros de busca de onboarding
 */
export const onboardingFiltersSchema = z.object({
  status: z.enum([...ONBOARDING_STATUSES] as [string, ...string[]]).optional(),
  employeeId: z.string().uuid().optional(),
  search: z.string().optional()
}) 