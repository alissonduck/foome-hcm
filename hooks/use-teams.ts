"use client"

/**
 * Hook para gerenciar equipes
 * Fornece métodos para interagir com equipes e subequipes
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { TeamService } from "@/lib/services/team-service"
import type {
  TeamInsert,
  TeamUpdate,
  SubteamInsert,
  SubteamUpdate,
  TeamMemberInsert,
  SubteamMemberInsert,
  TeamWithManager,
  TeamWithMembers,
  SubteamWithMembers,
} from "@/lib/types/teams"

export function useTeams() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<TeamWithManager[]>([])
  const [currentTeam, setCurrentTeam] = useState<TeamWithMembers | null>(null)
  const [currentSubteam, setCurrentSubteam] = useState<SubteamWithMembers | null>(null)

  /**
   * Carrega todas as equipes de uma empresa
   * @param companyId ID da empresa
   */
  const loadTeams = async (companyId: string) => {
    try {
      setLoading(true)
      const data = await TeamService.getTeams(companyId)
      setTeams(data)
    } catch (error) {
      console.error("Erro ao carregar equipes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as equipes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega os detalhes de uma equipe específica
   * @param teamId ID da equipe
   */
  const loadTeamDetails = async (teamId: string) => {
    try {
      setLoading(true)
      const data = await TeamService.getTeamWithMembers(teamId)
      setCurrentTeam(data)
    } catch (error) {
      console.error("Erro ao carregar detalhes da equipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da equipe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega os detalhes de uma subequipe específica
   * @param subteamId ID da subequipe
   */
  const loadSubteamDetails = async (subteamId: string) => {
    try {
      setLoading(true)
      const data = await TeamService.getSubteamWithMembers(subteamId)
      setCurrentSubteam(data)
    } catch (error) {
      console.error("Erro ao carregar detalhes da subequipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da subequipe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cria uma nova equipe
   * @param team Dados da equipe
   */
  const createTeam = async (team: TeamInsert) => {
    try {
      setLoading(true)
      await TeamService.createTeam(team)
      toast({
        title: "Sucesso",
        description: "Equipe criada com sucesso",
      })
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao criar equipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a equipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Atualiza uma equipe existente
   * @param id ID da equipe
   * @param team Dados atualizados da equipe
   */
  const updateTeam = async (id: string, team: TeamUpdate) => {
    try {
      setLoading(true)
      await TeamService.updateTeam(id, team)
      toast({
        title: "Sucesso",
        description: "Equipe atualizada com sucesso",
      })
      router.refresh()
      if (currentTeam?.id === id) {
        loadTeamDetails(id)
      }
      return true
    } catch (error) {
      console.error("Erro ao atualizar equipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a equipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Exclui uma equipe
   * @param id ID da equipe
   */
  const deleteTeam = async (id: string) => {
    try {
      setLoading(true)
      await TeamService.deleteTeam(id)
      toast({
        title: "Sucesso",
        description: "Equipe excluída com sucesso",
      })
      router.push("/dashboard/teams")
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao excluir equipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a equipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cria uma nova subequipe
   * @param subteam Dados da subequipe
   */
  const createSubteam = async (subteam: SubteamInsert) => {
    try {
      setLoading(true)
      await TeamService.createSubteam(subteam)
      toast({
        title: "Sucesso",
        description: "Subequipe criada com sucesso",
      })
      if (currentTeam?.id === subteam.team_id) {
        loadTeamDetails(subteam.team_id)
      }
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao criar subequipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a subequipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Atualiza uma subequipe existente
   * @param id ID da subequipe
   * @param subteam Dados atualizados da subequipe
   */
  const updateSubteam = async (id: string, subteam: SubteamUpdate) => {
    try {
      setLoading(true)
      await TeamService.updateSubteam(id, subteam)
      toast({
        title: "Sucesso",
        description: "Subequipe atualizada com sucesso",
      })
      router.refresh()
      if (currentSubteam?.id === id) {
        loadSubteamDetails(id)
      }
      return true
    } catch (error) {
      console.error("Erro ao atualizar subequipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a subequipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Exclui uma subequipe
   * @param id ID da subequipe
   * @param teamId ID da equipe pai
   */
  const deleteSubteam = async (id: string, teamId: string) => {
    try {
      setLoading(true)
      await TeamService.deleteSubteam(id)
      toast({
        title: "Sucesso",
        description: "Subequipe excluída com sucesso",
      })
      router.push(`/dashboard/teams/${teamId}`)
      router.refresh()
      if (currentTeam?.id === teamId) {
        loadTeamDetails(teamId)
      }
      return true
    } catch (error) {
      console.error("Erro ao excluir subequipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a subequipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Adiciona um funcionário a uma equipe
   * @param teamMember Dados do membro da equipe
   */
  const addTeamMember = async (teamMember: TeamMemberInsert) => {
    try {
      setLoading(true)
      await TeamService.addTeamMember(teamMember)
      toast({
        title: "Sucesso",
        description: "Membro adicionado à equipe com sucesso",
      })
      if (currentTeam?.id === teamMember.team_id) {
        loadTeamDetails(teamMember.team_id)
      }
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao adicionar membro à equipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro à equipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Remove um funcionário de uma equipe
   * @param teamId ID da equipe
   * @param employeeId ID do funcionário
   */
  const removeTeamMember = async (teamId: string, employeeId: string) => {
    try {
      setLoading(true)
      await TeamService.removeTeamMember(teamId, employeeId)
      toast({
        title: "Sucesso",
        description: "Membro removido da equipe com sucesso",
      })
      if (currentTeam?.id === teamId) {
        loadTeamDetails(teamId)
      }
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao remover membro da equipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Adiciona um funcionário a uma subequipe
   * @param subteamMember Dados do membro da subequipe
   */
  const addSubteamMember = async (subteamMember: SubteamMemberInsert) => {
    try {
      setLoading(true)
      await TeamService.addSubteamMember(subteamMember)
      toast({
        title: "Sucesso",
        description: "Membro adicionado à subequipe com sucesso",
      })
      if (currentSubteam?.id === subteamMember.subteam_id) {
        loadSubteamDetails(subteamMember.subteam_id)
      }
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao adicionar membro à subequipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro à subequipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Remove um funcionário de uma subequipe
   * @param subteamId ID da subequipe
   * @param employeeId ID do funcionário
   */
  const removeSubteamMember = async (subteamId: string, employeeId: string) => {
    try {
      setLoading(true)
      await TeamService.removeSubteamMember(subteamId, employeeId)
      toast({
        title: "Sucesso",
        description: "Membro removido da subequipe com sucesso",
      })
      if (currentSubteam?.id === subteamId) {
        loadSubteamDetails(subteamId)
      }
      router.refresh()
      return true
    } catch (error) {
      console.error("Erro ao remover membro da subequipe:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da subequipe",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    teams,
    currentTeam,
    currentSubteam,
    loadTeams,
    loadTeamDetails,
    loadSubteamDetails,
    createTeam,
    updateTeam,
    deleteTeam,
    createSubteam,
    updateSubteam,
    deleteSubteam,
    addTeamMember,
    removeTeamMember,
    addSubteamMember,
    removeSubteamMember,
  }
}

