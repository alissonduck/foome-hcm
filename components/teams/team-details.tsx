/**
 * Componente para exibir detalhes de uma equipe
 * Mostra informações da equipe, membros e subequipes
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useTeams } from "@/hooks/use-teams"
import type { TeamWithMembers, SubteamInsert, TeamMemberInsert } from "@/lib/types/teams"
import { Users, UserPlus, MoreVertical, Pencil, Trash2, Plus, UserMinus, Layers } from "lucide-react"

interface TeamDetailsProps {
  teamId: string
  initialTeam?: TeamWithMembers
  employees: Array<{
    id: string
    full_name: string
    position?: string | null
  }>
}

export function TeamDetails({ teamId, initialTeam, employees }: TeamDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const {
    loading,
    currentTeam,
    loadTeamDetails,
    updateTeam,
    deleteTeam,
    createSubteam,
    addTeamMember,
    removeTeamMember,
  } = useTeams()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isCreateSubteamDialogOpen, setIsCreateSubteamDialogOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    description: "",
    manager_id: "",
  })
  const [subteamFormData, setSubteamFormData] = useState({
    name: "",
    description: "",
    manager_id: "",
  })

  useEffect(() => {
    if (initialTeam) {
      // Se temos dados iniciais, usamos eles
    } else {
      // Caso contrário, carregamos do servidor
      loadTeamDetails(teamId)
    }
  }, [teamId, initialTeam, loadTeamDetails])

  useEffect(() => {
    if (currentTeam) {
      setTeamFormData({
        name: currentTeam.name,
        description: currentTeam.description || "",
        manager_id: currentTeam.manager_id || "",
      })
    }
  }, [currentTeam])

  const handleEditTeam = async () => {
    if (!teamFormData.name) {
      toast({
        title: "Erro",
        description: "O nome da equipe é obrigatório",
        variant: "destructive",
      })
      return
    }

    const updatedTeam = {
      name: teamFormData.name,
      description: teamFormData.description,
      manager_id: teamFormData.manager_id || null,
      updated_at: new Date().toISOString(),
    }

    const success = await updateTeam(teamId, updatedTeam)
    if (success) {
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteTeam = async () => {
    const success = await deleteTeam(teamId)
    if (success) {
      setIsDeleteDialogOpen(false)
      router.push("/dashboard/teams")
    }
  }

  const handleAddMember = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário para adicionar à equipe",
        variant: "destructive",
      })
      return
    }

    const teamMember: TeamMemberInsert = {
      team_id: teamId,
      employee_id: selectedEmployeeId,
      joined_at: new Date().toISOString(),
    }

    const success = await addTeamMember(teamMember)
    if (success) {
      setIsAddMemberDialogOpen(false)
      setSelectedEmployeeId("")
    }
  }

  const handleRemoveMember = async (employeeId: string) => {
    const success = await removeTeamMember(teamId, employeeId)
    if (success) {
      // Membro removido com sucesso
    }
  }

  const handleCreateSubteam = async () => {
    if (!subteamFormData.name) {
      toast({
        title: "Erro",
        description: "O nome da subequipe é obrigatório",
        variant: "destructive",
      })
      return
    }

    const newSubteam: SubteamInsert = {
      team_id: teamId,
      name: subteamFormData.name,
      description: subteamFormData.description,
      manager_id: subteamFormData.manager_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const success = await createSubteam(newSubteam)
    if (success) {
      setIsCreateSubteamDialogOpen(false)
      setSubteamFormData({
        name: "",
        description: "",
        manager_id: "",
      })
    }
  }

  // Filtra funcionários que ainda não são membros da equipe
  const availableEmployees = employees.filter((employee) => {
    if (!currentTeam) return true
    return !currentTeam.members.some((member) => member.id === employee.id)
  })

  const team = currentTeam || initialTeam

  if (!team && loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Tabs defaultValue="members">
          <TabsList className="w-full sm:w-auto">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </TabsList>
          <div className="mt-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </Tabs>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-lg font-medium text-center mb-2">Equipe não encontrada</p>
        <Button onClick={() => router.push("/dashboard/teams")}>Voltar para Equipes</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{team.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Equipe
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Equipe
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Equipe</CardTitle>
          {team.manager && (
            <CardDescription>
              Gestor: {team.manager.full_name} {team.manager.position ? `(${team.manager.position})` : ""}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {team.description ? <p>{team.description}</p> : <p className="text-gray-400 italic">Sem descrição</p>}
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="members" className="flex-1 sm:flex-none">
            <Users className="mr-2 h-4 w-4" />
            Membros ({team.member_count})
          </TabsTrigger>
          <TabsTrigger value="subteams" className="flex-1 sm:flex-none">
            <Layers className="mr-2 h-4 w-4" />
            Subequipes ({team.subteams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Membros da Equipe</h3>
            <Button onClick={() => setIsAddMemberDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </div>

          {team.members.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-center mb-2">Nenhum membro nesta equipe</p>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Adicione funcionários para começar a formar sua equipe
                </p>
                <Button onClick={() => setIsAddMemberDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Membro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell>{member.position || "-"}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                          <UserMinus className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subteams" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Subequipes</h3>
            <Button onClick={() => setIsCreateSubteamDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Subequipe
            </Button>
          </div>

          {team.subteams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Layers className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-center mb-2">Nenhuma subequipe encontrada</p>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Crie subequipes para organizar melhor seus funcionários
                </p>
                <Button onClick={() => setIsCreateSubteamDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Subequipe
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.subteams.map((subteam) => (
                <Card key={subteam.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{subteam.name}</CardTitle>
                        {subteam.manager && <CardDescription>Gestor: {subteam.manager.full_name}</CardDescription>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/teams/subteam/${subteam.id}`)}>
                            <Users className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subteam.description ? (
                      <p className="text-sm text-gray-500">{subteam.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Sem descrição</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Equipe */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipe</DialogTitle>
            <DialogDescription>Atualize as informações da equipe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Equipe *</Label>
              <Input
                id="edit-name"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={teamFormData.description}
                onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Gestor</Label>
              <Select
                value={teamFormData.manager_id}
                onValueChange={(value) => setTeamFormData({ ...teamFormData, manager_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} {employee.position ? `(${employee.position})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTeam}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a equipe "{team.name}"? Esta ação não pode ser desfeita e todas as
              subequipes também serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteTeam}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Adição de Membro */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription>Adicione um funcionário à equipe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="employee">Funcionário *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Todos os funcionários já são membros
                    </SelectItem>
                  ) : (
                    availableEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} {employee.position ? `(${employee.position})` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMember} disabled={availableEmployees.length === 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação de Subequipe */}
      <Dialog open={isCreateSubteamDialogOpen} onOpenChange={setIsCreateSubteamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Subequipe</DialogTitle>
            <DialogDescription>Crie uma nova subequipe dentro da equipe {team.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="subteam-name">Nome da Subequipe *</Label>
              <Input
                id="subteam-name"
                value={subteamFormData.name}
                onChange={(e) => setSubteamFormData({ ...subteamFormData, name: e.target.value })}
                placeholder="Ex: Frontend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subteam-description">Descrição</Label>
              <Textarea
                id="subteam-description"
                value={subteamFormData.description}
                onChange={(e) => setSubteamFormData({ ...subteamFormData, description: e.target.value })}
                placeholder="Descreva o propósito desta subequipe"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subteam-manager">Gestor</Label>
              <Select
                value={subteamFormData.manager_id}
                onValueChange={(value) => setSubteamFormData({ ...subteamFormData, manager_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} {employee.position ? `(${employee.position})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSubteamDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubteam}>Criar Subequipe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

