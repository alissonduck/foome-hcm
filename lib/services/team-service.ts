/**
 * Serviço para gerenciamento de equipes
 * Fornece métodos para interagir com as tabelas de equipes e subequipes
 */

import { createClient } from "@/lib/supabase/server"
import type {
  Team,
  TeamInsert,
  TeamUpdate,
  Subteam,
  SubteamInsert,
  SubteamUpdate,
  TeamMemberInsert,
  SubteamMemberInsert,
  TeamWithManager,
  TeamWithMembers,
  SubteamWithManager,
  SubteamWithMembers,
} from "@/lib/types/teams"

export class TeamService {
  /**
   * Obtém todas as equipes de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de equipes
   */
  static async getTeams(companyId: string): Promise<TeamWithManager[]> {
    const { data, error } = await (await createClient())
      .from("teams")
      .select(`
        *,
        manager:employees!teams_manager_id_fkey(
          id, full_name, email, position
        )
      `)
      .eq("company_id", companyId)
      .order("name")

    if (error) {
      console.error("Erro ao buscar equipes:", error)
      throw new Error("Não foi possível buscar as equipes")
    }

    return data as unknown as TeamWithManager[]
  }

  /**
   * Obtém uma equipe específica com seus membros e subequipes
   * @param teamId ID da equipe
   * @returns Detalhes da equipe com membros e subequipes
   */
  static async getTeamWithMembers(teamId: string): Promise<TeamWithMembers> {
    // Busca a equipe com o gestor
    const { data: team, error: teamError } = await (await createClient())
      .from("teams")
      .select(`
        *,
        manager:employees!teams_manager_id_fkey(
          id, full_name, email, position
        )
      `)
      .eq("id", teamId)
      .single()

    if (teamError) {
      console.error("Erro ao buscar equipe:", teamError)
      throw new Error("Não foi possível buscar os detalhes da equipe")
    }

    // Busca os membros da equipe
    const { data: members, error: membersError } = await (await createClient())
      .from("team_members")
      .select(`
        *,
        employee:employees(
          id, full_name, email, position
        )
      `)
      .eq("team_id", teamId)

    if (membersError) {
      console.error("Erro ao buscar membros da equipe:", membersError)
      throw new Error("Não foi possível buscar os membros da equipe")
    }

    // Busca as subequipes
    const { data: subteams, error: subteamsError } = await (await createClient())
      .from("subteams")
      .select(`
        *,
        manager:employees!subteams_manager_id_fkey(
          id, full_name, email, position
        )
      `)
      .eq("team_id", teamId)

    if (subteamsError) {
      console.error("Erro ao buscar subequipes:", subteamsError)
      throw new Error("Não foi possível buscar as subequipes")
    }

    // Formata os membros
    const formattedMembers = members.map((member: any) => ({
      id: member.employee.id,
      full_name: member.employee.full_name,
      email: member.employee.email,
      position: member.employee.position,
      joined_at: member.joined_at,
    }))

    return {
      ...(team as TeamWithManager),
      members: formattedMembers,
      subteams: subteams as unknown as SubteamWithManager[],
      member_count: formattedMembers.length,
    }
  }

  /**
   * Obtém uma subequipe específica com seus membros
   * @param subteamId ID da subequipe
   * @returns Detalhes da subequipe com membros
   */
  static async getSubteamWithMembers(subteamId: string): Promise<SubteamWithMembers> {
    // Busca a subequipe com o gestor
    const { data: subteam, error: subteamError } = await (await createClient())
      .from("subteams")
      .select(`
        *,
        manager:employees!subteams_manager_id_fkey(
          id, full_name, email, position
        )
      `)
      .eq("id", subteamId)
      .single()

    if (subteamError) {
      console.error("Erro ao buscar subequipe:", subteamError)
      throw new Error("Não foi possível buscar os detalhes da subequipe")
    }

    // Busca os membros da subequipe
    const { data: members, error: membersError } = await (await createClient())
      .from("subteam_members")
      .select(`
        *,
        employee:employees(
          id, full_name, email, position
        )
      `)
      .eq("subteam_id", subteamId)

    if (membersError) {
      console.error("Erro ao buscar membros da subequipe:", membersError)
      throw new Error("Não foi possível buscar os membros da subequipe")
    }

    // Formata os membros
    const formattedMembers = members.map((member: any) => ({
      id: member.employee.id,
      full_name: member.employee.full_name,
      email: member.employee.email,
      position: member.employee.position,
      joined_at: member.joined_at,
    }))

    return {
      ...(subteam as SubteamWithManager),
      members: formattedMembers,
      member_count: formattedMembers.length,
    }
  }

  /**
   * Cria uma nova equipe
   * @param team Dados da equipe
   * @returns Equipe criada
   */
  static async createTeam(team: TeamInsert): Promise<Team> {
    const { data, error } = await (await createClient()).from("teams").insert(team).select().single()

    if (error) {
      console.error("Erro ao criar equipe:", error)
      throw new Error("Não foi possível criar a equipe")
    }

    return data
  }

  /**
   * Atualiza uma equipe existente
   * @param id ID da equipe
   * @param team Dados atualizados da equipe
   * @returns Equipe atualizada
   */
  static async updateTeam(id: string, team: TeamUpdate): Promise<Team> {
    const { data, error } = await (await createClient()).from("teams").update(team).eq("id", id).select().single()

    if (error) {
      console.error("Erro ao atualizar equipe:", error)
      throw new Error("Não foi possível atualizar a equipe")
    }

    return data
  }

  /**
   * Exclui uma equipe
   * @param id ID da equipe
   * @returns Verdadeiro se a exclusão for bem-sucedida
   */
  static async deleteTeam(id: string): Promise<boolean> {
    const { error } = await (await createClient()).from("teams").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir equipe:", error)
      throw new Error("Não foi possível excluir a equipe")
    }

    return true
  }

  /**
   * Cria uma nova subequipe
   * @param subteam Dados da subequipe
   * @returns Subequipe criada
   */
  static async createSubteam(subteam: SubteamInsert): Promise<Subteam> {
    const { data, error } = await (await createClient()).from("subteams").insert(subteam).select().single()

    if (error) {
      console.error("Erro ao criar subequipe:", error)
      throw new Error("Não foi possível criar a subequipe")
    }

    return data
  }

  /**
   * Atualiza uma subequipe existente
   * @param id ID da subequipe
   * @param subteam Dados atualizados da subequipe
   * @returns Subequipe atualizada
   */
  static async updateSubteam(id: string, subteam: SubteamUpdate): Promise<Subteam> {
    const { data, error } = await (await createClient()).from("subteams").update(subteam).eq("id", id).select().single()

    if (error) {
      console.error("Erro ao atualizar subequipe:", error)
      throw new Error("Não foi possível atualizar a subequipe")
    }

    return data
  }

  /**
   * Exclui uma subequipe
   * @param id ID da subequipe
   * @returns Verdadeiro se a exclusão for bem-sucedida
   */
  static async deleteSubteam(id: string): Promise<boolean> {
    const { error } = await (await createClient()).from("subteams").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir subequipe:", error)
      throw new Error("Não foi possível excluir a subequipe")
    }

    return true
  }

  /**
   * Adiciona um funcionário a uma equipe
   * @param teamMember Dados do membro da equipe
   * @returns Verdadeiro se a adição for bem-sucedida
   */
  static async addTeamMember(teamMember: TeamMemberInsert): Promise<boolean> {
    const { error } = await (await createClient()).from("team_members").insert(teamMember)

    if (error) {
      console.error("Erro ao adicionar membro à equipe:", error)
      throw new Error("Não foi possível adicionar o membro à equipe")
    }

    return true
  }

  /**
   * Remove um funcionário de uma equipe
   * @param teamId ID da equipe
   * @param employeeId ID do funcionário
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeTeamMember(teamId: string, employeeId: string): Promise<boolean> {
    const { error } = await (await createClient())
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("employee_id", employeeId)

    if (error) {
      console.error("Erro ao remover membro da equipe:", error)
      throw new Error("Não foi possível remover o membro da equipe")
    }

    return true
  }

  /**
   * Adiciona um funcionário a uma subequipe
   * @param subteamMember Dados do membro da subequipe
   * @returns Verdadeiro se a adição for bem-sucedida
   */
  static async addSubteamMember(subteamMember: SubteamMemberInsert): Promise<boolean> {
    const { error } = await (await createClient()).from("subteam_members").insert(subteamMember)

    if (error) {
      console.error("Erro ao adicionar membro à subequipe:", error)
      throw new Error("Não foi possível adicionar o membro à subequipe")
    }

    return true
  }

  /**
   * Remove um funcionário de uma subequipe
   * @param subteamId ID da subequipe
   * @param employeeId ID do funcionário
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeSubteamMember(subteamId: string, employeeId: string): Promise<boolean> {
    const { error } = await (await createClient())
      .from("subteam_members")
      .delete()
      .eq("subteam_id", subteamId)
      .eq("employee_id", employeeId)

    if (error) {
      console.error("Erro ao remover membro da subequipe:", error)
      throw new Error("Não foi possível remover o membro da subequipe")
    }

    return true
  }
}

