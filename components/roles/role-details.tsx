/**
 * Componente de detalhes do cargo
 * Exibe informações detalhadas de um cargo
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Users, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { RoleWithDetails } from "@/lib/types/roles"
import { useRoles } from "@/hooks/use-roles"
import { RoleEmployeesList } from "@/components/roles/role-employees-list"
import { RoleSkillsList } from "@/components/roles/role-skills-list"
import { RoleCoursesList } from "@/components/roles/role-courses-list"
import { RoleLanguagesList } from "@/components/roles/role-languages-list"

interface RoleDetailsProps {
  role: RoleWithDetails
}

export function RoleDetails({ role }: RoleDetailsProps) {
  const router = useRouter()
  const { toggleRoleActive, deleteRole, isTogglingRoleActive, isDeletingRole } = useRoles()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)

  const handleToggleActive = () => {
    toggleRoleActive({ roleId: role.id, active: !role.active })
    setIsToggleDialogOpen(false)
  }

  const handleDelete = () => {
    deleteRole(role.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{role.title}</h1>
          <p className="text-muted-foreground">
            {role.cbo_name && `${role.cbo_name} - `}
            {role.cbo_number && `CBO: ${role.cbo_number}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsToggleDialogOpen(true)}
            disabled={isTogglingRoleActive}
          >
            {role.active ? (
              <>
                <ToggleRight className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeletingRole || role.employees_count > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>Detalhes básicos do cargo</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-medium">
                  {role.active ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Contrato</p>
                <p className="font-medium capitalize">{role.contract_type}</p>
              </div>
              {role.team && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipe</p>
                  <p className="font-medium">{role.team.name}</p>
                </div>
              )}
              {role.work_model && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modelo de Trabalho</p>
                  <p className="font-medium capitalize">{role.work_model}</p>
                </div>
              )}
              {role.level && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nível</p>
                  <p className="font-medium capitalize">{role.level}</p>
                </div>
              )}
              {role.seniority_level && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senioridade</p>
                  <p className="font-medium capitalize">{role.seniority_level}</p>
                </div>
              )}
              {role.seniority_scale && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Escala de Senioridade</p>
                  <p className="font-medium">{role.seniority_scale}/10</p>
                </div>
              )}
              {role.cnh && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CNH</p>
                  <p className="font-medium uppercase">{role.cnh}</p>
                </div>
              )}
              {role.education_level && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Escolaridade</p>
                  <p className="font-medium capitalize">{role.education_level}</p>
                </div>
              )}
              {role.education_status && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Situação da Graduação</p>
                  <p className="font-medium capitalize">{role.education_status}</p>
                </div>
              )}
              {role.salary && role.salary_periodicity && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Salário</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(role.salary)}{" "}
                    <span className="text-sm text-muted-foreground">/ {role.salary_periodicity}</span>
                  </p>
                </div>
              )}
            </div>

            {role.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p className="whitespace-pre-line">{role.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requisitos e Entregas</CardTitle>
            <CardDescription>Requisitos e resultados esperados</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {role.required_requirements && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requisitos Obrigatórios</p>
                <p className="whitespace-pre-line">{role.required_requirements}</p>
              </div>
            )}
            {role.desired_requirements && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requisitos Desejáveis</p>
                <p className="whitespace-pre-line">{role.desired_requirements}</p>
              </div>
            )}
            {role.deliveries_results && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entregas e Resultados</p>
                <p className="whitespace-pre-line">{role.deliveries_results}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">
            <Users className="mr-2 h-4 w-4" />
            Funcionários ({role.employees_count})
          </TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="languages">Idiomas</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-4">
          <RoleEmployeesList roleId={role.id} />
        </TabsContent>
        <TabsContent value="skills" className="mt-4">
          <RoleSkillsList technicalSkills={role.technical_skills} behavioralSkills={role.behavioral_skills} />
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <RoleCoursesList courses={role.courses} complementaryCourses={role.complementary_courses} />
        </TabsContent>
        <TabsContent value="languages" className="mt-4">
          <RoleLanguagesList languages={role.languages} />
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmação para ativar/desativar */}
      <AlertDialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{role.active ? "Desativar cargo" : "Ativar cargo"}</AlertDialogTitle>
            <AlertDialogDescription>
              {role.active
                ? "Tem certeza que deseja desativar este cargo? Ele não aparecerá mais nas listagens padrão."
                : "Tem certeza que deseja ativar este cargo? Ele aparecerá nas listagens padrão."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>{role.active ? "Desativar" : "Ativar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para excluir */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.
              {role.employees_count > 0 && (
                <p className="mt-2 font-medium text-destructive">
                  Este cargo não pode ser excluído porque possui {role.employees_count} funcionário(s) associado(s).
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={role.employees_count > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

