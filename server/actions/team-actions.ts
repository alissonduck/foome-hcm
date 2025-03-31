"use server"

/**
 * Server actions para gerenciamento de equipes
 * Fornece ações do servidor para operações com equipes
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import type {
  TeamWithManager,
  TeamWithMembers,
  SubteamWithMembers
} from "@/lib/types/teams"

/**
 * Obtém todas as equipes de uma empresa
 * @returns Lista de equipes
 */
export async function getTeams(): Promise<TeamWithManager[]> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("teams")
      .select(`
        *,
        manager:manager_id(
          id, full_name
        )
      `)
      .eq("company_id", company.id)
      .order("name")
    
    if (error) {
      console.error("Erro ao buscar equipes:", error)
      throw new Error("Não foi possível buscar as equipes")
    }
    
    return data as unknown as TeamWithManager[]
  } catch (error) {
    console.error("Erro ao buscar equipes:", error)
    throw new Error(`Não foi possível buscar as equipes: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém os detalhes de uma equipe específica
 * @param teamId ID da equipe
 * @returns Equipe com membros
 */
export async function getTeamWithMembers(teamId: string): Promise<TeamWithMembers> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca os dados da equipe com o gerente
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select(`
        *,
        manager:manager_id(
          id, full_name
        )
      `)
      .eq("id", teamId)
      .single()
    
    if (teamError) {
      console.error("Erro ao buscar equipe:", teamError)
      throw new Error("Equipe não encontrada")
    }
    
    // Verifica se a equipe pertence à empresa do usuário
    if (team.company_id !== company.id) {
      throw new Error("Esta equipe não pertence à sua empresa")
    }
    
    // Busca as subequipes
    const { data: subteams, error: subteamsError } = await supabase
      .from("subteams")
      .select(`
        *,
        coordinator:coordinator_id(
          id, full_name
        )
      `)
      .eq("team_id", teamId)
      .order("name")
    
    if (subteamsError) {
      console.error("Erro ao buscar subequipes:", subteamsError)
      throw new Error("Não foi possível buscar as subequipes")
    }
    
    // Busca os membros da equipe
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select(`
        *,
        employee:employee_id(
          id, full_name, email, position
        )
      `)
      .eq("team_id", teamId)
    
    if (membersError) {
      console.error("Erro ao buscar membros da equipe:", membersError)
      throw new Error("Não foi possível buscar os membros da equipe")
    }
    
    return {
      ...team,
      subteams: subteams || [],
      members: members || []
    } as unknown as TeamWithMembers
  } catch (error) {
    console.error("Erro ao buscar detalhes da equipe:", error)
    throw new Error(`Não foi possível buscar os detalhes da equipe: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém os detalhes de uma subequipe específica
 * @param subteamId ID da subequipe
 * @returns Subequipe com membros
 */
export async function getSubteamWithMembers(subteamId: string): Promise<SubteamWithMembers> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca os dados da subequipe com o coordenador
    const { data: subteam, error: subteamError } = await supabase
      .from("subteams")
      .select(`
        *,
        coordinator:coordinator_id(
          id, full_name
        ),
        team:team_id(
          id, name, company_id
        )
      `)
      .eq("id", subteamId)
      .single()
    
    if (subteamError) {
      console.error("Erro ao buscar subequipe:", subteamError)
      throw new Error("Subequipe não encontrada")
    }
    
    // Verifica se a subequipe pertence à empresa do usuário
    if (subteam.team.company_id !== company.id) {
      throw new Error("Esta subequipe não pertence à sua empresa")
    }
    
    // Busca os membros da subequipe
    const { data: members, error: membersError } = await supabase
      .from("subteam_members")
      .select(`
        *,
        employee:employee_id(
          id, full_name, email, position
        )
      `)
      .eq("subteam_id", subteamId)
    
    if (membersError) {
      console.error("Erro ao buscar membros da subequipe:", membersError)
      throw new Error("Não foi possível buscar os membros da subequipe")
    }
    
    return {
      ...subteam,
      members: members || []
    } as unknown as SubteamWithMembers
  } catch (error) {
    console.error("Erro ao buscar detalhes da subequipe:", error)
    throw new Error(`Não foi possível buscar os detalhes da subequipe: ${error instanceof Error ? error.message : String(error)}`)
  }
} 