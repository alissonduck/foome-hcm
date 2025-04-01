/**
 * Tipos para equipes e subequipes
 * Define os tipos utilizados para gerenciar equipes e subequipes
 */

import type { Database } from "@/lib/supabase/types"

// Tipo para equipe
export type Team = Database["public"]["Tables"]["teams"]["Row"]
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"]
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"]

// Tipo para subequipe
export type Subteam = Database["public"]["Tables"]["subteams"]["Row"]
export type SubteamInsert = Database["public"]["Tables"]["subteams"]["Insert"]
export type SubteamUpdate = Database["public"]["Tables"]["subteams"]["Update"]

// Tipo para membro de equipe
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"]
export type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"]
export type TeamMemberUpdate = Database["public"]["Tables"]["team_members"]["Update"]

// Tipo para membro de subequipe
export type SubteamMember = Database["public"]["Tables"]["subteam_members"]["Row"]
export type SubteamMemberInsert = Database["public"]["Tables"]["subteam_members"]["Insert"]
export type SubteamMemberUpdate = Database["public"]["Tables"]["subteam_members"]["Update"]

// Tipo para equipe com informações do gestor
export interface TeamWithManager extends Team {
  manager?: {
    id: string
    full_name: string
    email: string
    position?: string | null
  } | null
}

// Tipo para subequipe com informações do gestor
export interface SubteamWithManager extends Subteam {
  manager?: {
    id: string
    full_name: string
    email: string
    position?: string | null
  } | null
}

// Tipo para equipe com membros
export interface TeamWithMembers extends TeamWithManager {
  company_id: string;
  members: Array<{
    id: string
    full_name: string
    email: string
    position?: string | null
    joined_at: string
  }>
  subteams: SubteamWithManager[]
  member_count: number
}

// Tipo para subequipe com membros
export interface SubteamWithMembers extends SubteamWithManager {
  members: Array<{
    id: string
    full_name: string
    email: string
    position?: string | null
    joined_at: string
  }>
  member_count: number
}

