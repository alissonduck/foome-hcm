/**
 * Tipos para cargos
 * Define os tipos utilizados para gerenciar cargos
 */

import type { Database } from "@/lib/supabase/types"

// Tipo para cargo
export type Role = Database["public"]["Tables"]["roles"]["Row"]
export type RoleInsert = Database["public"]["Tables"]["roles"]["Insert"]
export type RoleUpdate = Database["public"]["Tables"]["roles"]["Update"]

// Tipo para histórico de cargos dos funcionários
export type RoleEmployee = Database["public"]["Tables"]["employee_roles"]["Row"]
export type RoleEmployeeInsert = Database["public"]["Tables"]["employee_roles"]["Insert"]
export type RoleEmployeeUpdate = Database["public"]["Tables"]["employee_roles"]["Update"]

// Tipo para cursos requeridos para o cargo
export type RoleCourse = Database["public"]["Tables"]["role_courses"]["Row"]
export type RoleCourseInsert = Database["public"]["Tables"]["role_courses"]["Insert"]
export type RoleCourseUpdate = Database["public"]["Tables"]["role_courses"]["Update"]

// Tipo para cursos complementares para o cargo
export type RoleComplementaryCourse = Database["public"]["Tables"]["role_complementary_courses"]["Row"]
export type RoleComplementaryCourseInsert = Database["public"]["Tables"]["role_complementary_courses"]["Insert"]
export type RoleComplementaryCourseUpdate = Database["public"]["Tables"]["role_complementary_courses"]["Update"]

// Tipo para habilidades técnicas para o cargo
export type RoleTechnicalSkill = Database["public"]["Tables"]["role_technical_skills"]["Row"]
export type RoleTechnicalSkillInsert = Database["public"]["Tables"]["role_technical_skills"]["Insert"]
export type RoleTechnicalSkillUpdate = Database["public"]["Tables"]["role_technical_skills"]["Update"]

// Tipo para habilidades comportamentais para o cargo
export type RoleBehavioralSkill = Database["public"]["Tables"]["role_behavioral_skills"]["Row"]
export type RoleBehavioralSkillInsert = Database["public"]["Tables"]["role_behavioral_skills"]["Insert"]
export type RoleBehavioralSkillUpdate = Database["public"]["Tables"]["role_behavioral_skills"]["Update"]

// Tipo para idiomas requeridos para o cargo
export type RoleLanguage = Database["public"]["Tables"]["role_languages"]["Row"]
export type RoleLanguageInsert = Database["public"]["Tables"]["role_languages"]["Insert"]
export type RoleLanguageUpdate = Database["public"]["Tables"]["role_languages"]["Update"]

// Tipo para cargo com informações da equipe
export interface RoleWithTeam extends Role {
  team?: {
    id: string
    name: string
  } | null
}

// Tipo para cargo com todas as informações relacionadas
export interface RoleWithDetails extends RoleWithTeam {
  courses: RoleCourse[]
  complementary_courses: RoleComplementaryCourse[]
  technical_skills: RoleTechnicalSkill[]
  behavioral_skills: RoleBehavioralSkill[]
  languages: RoleLanguage[]
  employees_count: number
}

// Tipo para histórico de cargo com informações do funcionário e cargo
export interface RoleEmployeeWithDetails extends RoleEmployee {
  employee: {
    id: string
    full_name: string
    email: string
    position?: string | null
  }
  role: {
    id: string
    title: string
    contract_type: string
  }
}

// Constantes para os tipos de contrato
export const CONTRACT_TYPES = [
  "clt",
  "aprendiz",
  "estagiário",
  "pj",
  "terceiro",
  "temporário",
  "sócio",
  "intermitente",
] as const

// Constantes para periodicidade do salário
export const SALARY_PERIODICITIES = [
  "hora",
  "diário",
  "semanal",
  "quinzenal",
  "mensal",
  "trimestral",
  "semestral",
  "anual",
] as const

// Constantes para tipos de CNH
export const CNH_TYPES = ["a", "b", "c", "d", "e", "ab", "ac", "ad", "ae"] as const

// Constantes para modelos de trabalho
export const WORK_MODELS = ["remoto", "híbrido", "presencial"] as const

// Constantes para níveis
export const ROLE_LEVELS = [
  "aprendiz",
  "estagiário",
  "analista",
  "assistente",
  "auxiliar",
  "coordenador",
  "especialista",
  "gerente",
  "supervisor",
  "diretor",
  "presidente",
  "outro",
] as const

// Constantes para níveis de senioridade
export const SENIORITY_LEVELS = ["junior", "pleno", "senior", "especialista", "master"] as const

// Constantes para níveis de escolaridade
export const EDUCATION_LEVELS = [
  "ensino fundamental",
  "ensino médio",
  "ensino médio técnico",
  "técnico",
  "graduação",
  "pós-graduação",
  "mba",
  "mestrado",
  "doutorado",
] as const

// Constantes para situação da graduação
export const EDUCATION_STATUSES = ["completo", "cursando", "indiferente"] as const

// Constantes para níveis de habilidade
export const SKILL_LEVELS = ["básico", "intermediário", "avançado", "fluente"] as const

