/**
 * Schemas Zod para validação de cargos
 */

import { z } from "zod"
import {
  CONTRACT_TYPES,
  SALARY_PERIODICITIES,
  CNH_TYPES,
  WORK_MODELS,
  ROLE_LEVELS,
  SENIORITY_LEVELS,
  EDUCATION_LEVELS,
  EDUCATION_STATUSES,
  SKILL_LEVELS,
} from "@/lib/types/roles"

// Schema para validação de cargo
export const roleSchema = z.object({
  company_id: z.string().uuid(),
  title: z.string().min(1, "O título é obrigatório"),
  cbo_name: z.string().optional().nullable(),
  cbo_number: z.string().optional().nullable(),
  contract_type: z.enum(CONTRACT_TYPES as [string, ...string[]]),
  active: z.boolean().default(true),
  team_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  salary_periodicity: z
    .enum(SALARY_PERIODICITIES as [string, ...string[]])
    .optional()
    .nullable(),
  salary: z.number().positive().optional().nullable(),
  cnh: z
    .enum(CNH_TYPES as [string, ...string[]])
    .optional()
    .nullable(),
  work_model: z
    .enum(WORK_MODELS as [string, ...string[]])
    .optional()
    .nullable(),
  level: z
    .enum(ROLE_LEVELS as [string, ...string[]])
    .optional()
    .nullable(),
  seniority_level: z
    .enum(SENIORITY_LEVELS as [string, ...string[]])
    .optional()
    .nullable(),
  seniority_scale: z.number().min(1).max(10).optional().nullable(),
  required_requirements: z.string().optional().nullable(),
  desired_requirements: z.string().optional().nullable(),
  deliveries_results: z.string().optional().nullable(),
  education_level: z
    .enum(EDUCATION_LEVELS as [string, ...string[]])
    .optional()
    .nullable(),
  education_status: z
    .enum(EDUCATION_STATUSES as [string, ...string[]])
    .optional()
    .nullable(),
})

// Schema para validação de curso
export const roleCourseSchema = z.object({
  role_id: z.string().uuid(),
  name: z.string().min(1, "O nome do curso é obrigatório"),
  is_required: z.boolean().default(false),
})

// Schema para validação de curso complementar
export const roleComplementaryCourseSchema = z.object({
  role_id: z.string().uuid(),
  name: z.string().min(1, "O nome do curso é obrigatório"),
})

// Schema para validação de habilidade técnica
export const roleTechnicalSkillSchema = z.object({
  role_id: z.string().uuid(),
  name: z.string().min(1, "O nome da habilidade é obrigatório"),
  level: z
    .enum(SKILL_LEVELS as [string, ...string[]])
    .optional()
    .nullable(),
})

// Schema para validação de habilidade comportamental
export const roleBehavioralSkillSchema = z.object({
  role_id: z.string().uuid(),
  name: z.string().min(1, "O nome da habilidade é obrigatório"),
  level: z
    .enum(SKILL_LEVELS as [string, ...string[]])
    .optional()
    .nullable(),
})

// Schema para validação de idioma
export const roleLanguageSchema = z.object({
  role_id: z.string().uuid(),
  name: z.string().min(1, "O nome do idioma é obrigatório"),
  level: z
    .enum(SKILL_LEVELS as [string, ...string[]])
    .optional()
    .nullable(),
  is_required: z.boolean().default(false),
})

// Schema para validação de atribuição de cargo a funcionário
export const roleEmployeeSchema = z.object({
  role_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().default(true),
})

// Schema para formulário de cargo completo
export const roleFormSchema = roleSchema.extend({
  courses: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        is_required: z.boolean().default(false),
      }),
    )
    .default([]),
  complementary_courses: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
      }),
    )
    .default([]),
  technical_skills: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        level: z
          .enum(SKILL_LEVELS as [string, ...string[]])
          .optional()
          .nullable(),
      }),
    )
    .default([]),
  behavioral_skills: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        level: z
          .enum(SKILL_LEVELS as [string, ...string[]])
          .optional()
          .nullable(),
      }),
    )
    .default([]),
  languages: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        level: z
          .enum(SKILL_LEVELS as [string, ...string[]])
          .optional()
          .nullable(),
        is_required: z.boolean().default(false),
      }),
    )
    .default([]),
})

// Tipo inferido do schema de formulário
export type RoleFormValues = z.infer<typeof roleFormSchema>

