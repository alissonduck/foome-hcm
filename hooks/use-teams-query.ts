"use client"

/**
 * Hook para gerenciar equipes usando React Query
 * Fornece métodos para consultar e manipular dados de equipes
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { TeamService } from "@/lib/services/team-service"
import { useRouter } from "next/navigation"
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

/**
 * Hook para gerenciar equipes usando React Query
 */
export function useTeamsQuery() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Consulta para obter todas as equipes de uma empresa
  const useTeamsQuery = (companyId: string) => {
    return useQuery({
      queryKey: ["teams", companyId],
      queryFn: () => TeamService.getTeams(companyId),
    })
  }

  // Consulta para obter uma equipe específica com seus membros
  const useTeamDetailsQuery = (teamId: string) => {
    return useQuery({
      queryKey: ["team", teamId],
      queryFn: () => TeamService.getTeamWithMembers(teamId),
      enabled: !!teamId,
    })
  }

  // Consulta para obter uma subequipe específica com seus membros
  const useSubteamDetailsQuery = (subteamId: string) => {
    return useQuery({
      queryKey: ["subteam", subteamId],
      queryFn: () => TeamService.getSubteamWithMembers(subteamId),
      enabled: !!subteamId,
    })
  }

  // Mutação para criar uma nova equipe
  const useCreateTeamMutation = () => {
    return useMutation({
      mutationFn: (data: TeamInsert) => TeamService.createTeam(data),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Equipe criada com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["teams", variables.company_id] })
        router.push("/dashboard/teams")
        router.refresh()
      },
      onError: (error) => {
        console.error("[CREATE_TEAM_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível criar a equipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para atualizar uma equipe existente
  const useUpdateTeamMutation = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: TeamUpdate }) => TeamService.updateTeam(id, data),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Equipe atualizada com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["team", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["teams"] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[UPDATE_TEAM_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a equipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para excluir uma equipe
  const useDeleteTeamMutation = () => {
    return useMutation({
      mutationFn: (id: string) => TeamService.deleteTeam(id),
      onSuccess: () => {
        toast({
          title: "Sucesso",
          description: "Equipe excluída com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["teams"] })
        router.push("/dashboard/teams")
        router.refresh()
      },
      onError: (error) => {
        console.error("[DELETE_TEAM_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir a equipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para criar uma nova subequipe
  const useCreateSubteamMutation = () => {
    return useMutation({
      mutationFn: (data: SubteamInsert) => TeamService.createSubteam(data),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Subequipe criada com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["team", variables.team_id] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[CREATE_SUBTEAM_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível criar a subequipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para atualizar uma subequipe existente
  const useUpdateSubteamMutation = () => {
    return useMutation({
      mutationFn: ({ id, data, teamId }: { id: string; data: SubteamUpdate; teamId: string }) => 
        TeamService.updateSubteam(id, data),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Subequipe atualizada com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["subteam", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[UPDATE_SUBTEAM_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a subequipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para excluir uma subequipe
  const useDeleteSubteamMutation = () => {
    return useMutation({
      mutationFn: ({ id, teamId }: { id: string; teamId: string }) => TeamService.deleteSubteam(id),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Subequipe excluída com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[DELETE_SUBTEAM_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir a subequipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para adicionar um membro a uma equipe
  const useAddTeamMemberMutation = () => {
    return useMutation({
      mutationFn: (data: TeamMemberInsert) => TeamService.addTeamMember(data),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Membro adicionado à equipe com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["team", variables.team_id] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[ADD_TEAM_MEMBER_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o membro à equipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para remover um membro de uma equipe
  const useRemoveTeamMemberMutation = () => {
    return useMutation({
      mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) => 
        TeamService.removeTeamMember(teamId, employeeId),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Membro removido da equipe com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[REMOVE_TEAM_MEMBER_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível remover o membro da equipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para adicionar um membro a uma subequipe
  const useAddSubteamMemberMutation = () => {
    return useMutation({
      mutationFn: (data: SubteamMemberInsert) => TeamService.addSubteamMember(data),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Membro adicionado à subequipe com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["subteam", variables.subteam_id] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[ADD_SUBTEAM_MEMBER_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o membro à subequipe",
          variant: "destructive",
        })
      },
    })
  }

  // Mutação para remover um membro de uma subequipe
  const useRemoveSubteamMemberMutation = () => {
    return useMutation({
      mutationFn: ({ subteamId, employeeId }: { subteamId: string; employeeId: string }) => 
        TeamService.removeSubteamMember(subteamId, employeeId),
      onSuccess: (_, variables) => {
        toast({
          title: "Sucesso",
          description: "Membro removido da subequipe com sucesso",
        })
        queryClient.invalidateQueries({ queryKey: ["subteam", variables.subteamId] })
        router.refresh()
      },
      onError: (error) => {
        console.error("[REMOVE_SUBTEAM_MEMBER_ERROR]", error)
        toast({
          title: "Erro",
          description: "Não foi possível remover o membro da subequipe",
          variant: "destructive",
        })
      },
    })
  }

  return {
    // Consultas
    useTeamsQuery,
    useTeamDetailsQuery,
    useSubteamDetailsQuery,
    
    // Mutações para equipes
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
    
    // Mutações para subequipes
    useCreateSubteamMutation,
    useUpdateSubteamMutation,
    useDeleteSubteamMutation,
    
    // Mutações para membros de equipes
    useAddTeamMemberMutation,
    useRemoveTeamMemberMutation,
    
    // Mutações para membros de subequipes
    useAddSubteamMemberMutation,
    useRemoveSubteamMemberMutation,
  }
} 