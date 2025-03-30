/**
 * Schema para validação de equipes
 * Define os schemas para validação de dados de equipes e subequipes
 */

import { z } from "zod"

/**
 * Schema para criação de uma nova equipe
 */
export const teamCreateSchema = z.object({
  name: z.string().min(1, { message: "Nome da equipe é obrigatório" }).max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  company_id: z.string().uuid({ message: "ID de empresa inválido" }),
  manager_id: z.string().uuid({ message: "ID de gestor inválido" }),
  description: z.string().max(500, { message: "Descrição deve ter no máximo 500 caracteres" }).optional(),
  created_by: z.string().uuid({ message: "ID de criador inválido" }),
})

/**
 * Schema para atualização de uma equipe existente
 */
export const teamUpdateSchema = z.object({
  name: z.string().min(1, { message: "Nome da equipe é obrigatório" }).max(100, { message: "Nome deve ter no máximo 100 caracteres" }).optional(),
  manager_id: z.string().uuid({ message: "ID de gestor inválido" }).optional(),
  description: z.string().max(500, { message: "Descrição deve ter no máximo 500 caracteres" }).optional(),
  updated_at: z.string().optional(),
})

/**
 * Schema para criação de uma nova subequipe
 */
export const subteamCreateSchema = z.object({
  name: z.string().min(1, { message: "Nome da subequipe é obrigatório" }).max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  team_id: z.string().uuid({ message: "ID de equipe inválido" }),
  manager_id: z.string().uuid({ message: "ID de gestor inválido" }),
  description: z.string().max(500, { message: "Descrição deve ter no máximo 500 caracteres" }).optional(),
  created_by: z.string().uuid({ message: "ID de criador inválido" }),
})

/**
 * Schema para atualização de uma subequipe existente
 */
export const subteamUpdateSchema = z.object({
  name: z.string().min(1, { message: "Nome da subequipe é obrigatório" }).max(100, { message: "Nome deve ter no máximo 100 caracteres" }).optional(),
  manager_id: z.string().uuid({ message: "ID de gestor inválido" }).optional(),
  description: z.string().max(500, { message: "Descrição deve ter no máximo 500 caracteres" }).optional(),
  updated_at: z.string().optional(),
})

/**
 * Schema para adicionar um membro a uma equipe
 */
export const teamMemberSchema = z.object({
  team_id: z.string().uuid({ message: "ID de equipe inválido" }),
  employee_id: z.string().uuid({ message: "ID de funcionário inválido" }),
})

/**
 * Schema para adicionar um membro a uma subequipe
 */
export const subteamMemberSchema = z.object({
  subteam_id: z.string().uuid({ message: "ID de subequipe inválido" }),
  employee_id: z.string().uuid({ message: "ID de funcionário inválido" }),
})

// Exporta tipos derivados dos schemas
export type TeamCreate = z.infer<typeof teamCreateSchema>
export type TeamUpdate = z.infer<typeof teamUpdateSchema>
export type SubteamCreate = z.infer<typeof subteamCreateSchema>
export type SubteamUpdate = z.infer<typeof subteamUpdateSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>
export type SubteamMember = z.infer<typeof subteamMemberSchema> 