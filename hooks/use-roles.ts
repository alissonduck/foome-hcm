/**
 * Hook para gerenciar cargos
 * Contém métodos para interagir com cargos usando React Query
 */
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { RoleFormValues } from "@/lib/schemas/role-schema"
import { roleService } from "@/lib/services/role-service"
import type { RoleWithDetails, RoleWithTeam } from "@/lib/types/roles"

export function useRoles() {
  const queryClient = useQueryClient()

  // Consultas
  const useRolesQuery = (companyId: string) =>
    useQuery({
      queryKey: ["roles", companyId],
      queryFn: () => roleService.getRoles(companyId),
    })

  const useRoleDetailsQuery = (roleId: string) =>
    useQuery({
      queryKey: ["role", roleId],
      queryFn: () => roleService.getRoleDetails(roleId),
      enabled: !!roleId,
    })

  const useEmployeeRoleHistoryQuery = (employeeId: string) =>
    useQuery({
      queryKey: ["employeeRoleHistory", employeeId],
      queryFn: () => roleService.getEmployeeRoleHistory(employeeId),
      enabled: !!employeeId,
    })

  const useRoleEmployeesQuery = (roleId: string) =>
    useQuery({
      queryKey: ["roleEmployees", roleId],
      queryFn: () => roleService.getRoleEmployees(roleId),
      enabled: !!roleId,
    })

  const useRoleCoursesQuery = (roleId: string) =>
    useQuery({
      queryKey: ["roleCourses", roleId],
      queryFn: () => roleService.getRoleDetails(roleId).then((role: RoleWithDetails) => role.courses),
      enabled: !!roleId,
    })

  const useRoleComplementaryCoursesQuery = (roleId: string) =>
    useQuery({
      queryKey: ["roleComplementaryCourses", roleId],
      queryFn: () => roleService.getRoleDetails(roleId).then((role: RoleWithDetails) => role.complementary_courses),
      enabled: !!roleId,
    })

  const useRoleTechnicalSkillsQuery = (roleId: string) =>
    useQuery({
      queryKey: ["roleTechnicalSkills", roleId],
      queryFn: () => roleService.getRoleDetails(roleId).then((role: RoleWithDetails) => role.technical_skills),
      enabled: !!roleId,
    })

  const useRoleBehavioralSkillsQuery = (roleId: string) =>
    useQuery({
      queryKey: ["roleBehavioralSkills", roleId],
      queryFn: () => roleService.getRoleDetails(roleId).then((role: RoleWithDetails) => role.behavioral_skills),
      enabled: !!roleId,
    })

  const useRoleLanguagesQuery = (roleId: string) =>
    useQuery({
      queryKey: ["roleLanguages", roleId],
      queryFn: () => roleService.getRoleDetails(roleId).then((role: RoleWithDetails) => role.languages),
      enabled: !!roleId,
    })

  // Mutações
  const useCreateRoleMutation = () =>
    useMutation({
      mutationFn: (params: RoleFormValues) => roleService.createRole(params),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["roles", variables.company_id] })
        toast.success("Cargo criado com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao criar cargo: ${error.message}`)
      },
    })

  const useUpdateRoleMutation = () =>
    useMutation({
      mutationFn: ({ roleId, params }: { roleId: string; params: RoleFormValues }) =>
        roleService.updateRole(roleId, params),
      onSuccess: (data: RoleWithTeam) => {
        queryClient.invalidateQueries({ queryKey: ["roles"] })
        queryClient.invalidateQueries({ queryKey: ["role", data.id] })
        toast.success("Cargo atualizado com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar cargo: ${error.message}`)
      },
    })

  const useToggleRoleActiveMutation = () =>
    useMutation({
      mutationFn: ({ roleId, active }: { roleId: string; active: boolean }) =>
        roleService.toggleRoleActive(roleId, active),
      onSuccess: (success: boolean, variables) => {
        queryClient.invalidateQueries({ queryKey: ["roles"] })
        queryClient.invalidateQueries({ queryKey: ["role", variables.roleId] })
      },
    })

  const useDeleteRoleMutation = () =>
    useMutation({
      mutationFn: (roleId: string) => roleService.deleteRole(roleId),
      onSuccess: (_, roleId) => {
        queryClient.invalidateQueries({ queryKey: ["roles"] })
        queryClient.removeQueries({ queryKey: ["role", roleId] })
        toast.success("Cargo excluído com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao excluir cargo: ${error.message}`)
      },
    })

  const useAssignRoleToEmployeeMutation = () =>
    useMutation({
      mutationFn: ({
        roleId,
        employeeId,
        startDate,
      }: {
        roleId: string
        employeeId: string
        startDate: string
      }) => {
        return roleService.assignRoleToEmployee({
          role_id: roleId,
          employee_id: employeeId,
          start_date: startDate,
        })
      },
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["employeeRoleHistory", data.employee_id] })
        queryClient.invalidateQueries({ queryKey: ["roleEmployees", data.role_id] })
      },
    })

  const useEndRoleAssignmentMutation = () =>
    useMutation({
      mutationFn: ({
        roleEmployeeId,
        endDate,
      }: {
        roleEmployeeId: string
        endDate: string
      }) => roleService.endRoleAssignment(roleEmployeeId, endDate),
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["employeeRoleHistory", data.employee_id] })
        queryClient.invalidateQueries({ queryKey: ["roleEmployees", data.role_id] })
      },
    })

  return {
    // Consultas
    useRolesQuery,
    useRoleDetailsQuery,
    useEmployeeRoleHistoryQuery,
    useRoleEmployeesQuery,
    useRoleCoursesQuery,
    useRoleComplementaryCoursesQuery,
    useRoleTechnicalSkillsQuery,
    useRoleBehavioralSkillsQuery,
    useRoleLanguagesQuery,

    // Mutações
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useToggleRoleActiveMutation,
    useDeleteRoleMutation,
    useAssignRoleToEmployeeMutation,
    useEndRoleAssignmentMutation,
  }
}

