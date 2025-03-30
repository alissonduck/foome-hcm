/**
 * Componente para listar equipes
 * Exibe uma lista de equipes com opções para gerenciá-las
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useTeams } from "@/hooks/use-teams"
import type { TeamWithManager, TeamInsert } from "@/lib/types/teams"
import { Users, MoreVertical, Pencil, Trash2, Plus } from "lucide-react"

interface TeamListProps {
  companyId: string
  initialTeams?: TeamWithManager[]
  employees: Array<{
    id: string
    full_name: string
    position?: string | null
  }>
}

export function TeamList({ companyId, initialTeams = [], employees }: TeamListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { loading, teams, loadTeams, createTeam, updateTeam, deleteTeam } = useTeams()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<TeamWithManager | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    manager_id: string
  }>({
    name: "",
    description: "",
    manager_id: "",
  })

  useEffect(() => {
    if (initialTeams.length > 0) {
      // Se temos equipes iniciais, usamos elas
      // Isso é útil para SSR
    } else {
      // Caso contrário, carregamos do servidor
      loadTeams(companyId)
    }
  }, [companyId, initialTeams, loadTeams])

  const handleCreateTeam = async () => {
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "O nome da equipe é obrigatório",
        variant: "destructive",
      })
      return
    }

    const newTeam: TeamInsert = {
      company_id: companyId,
      name: formData.name,
      description: formData.description,
      manager_id: formData.manager_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const success = await createTeam(newTeam)
    if (success) {
      setIsCreateDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        manager_id: "",
      })
      loadTeams(companyId)
    }
  }

  const handleEditTeam = async () => {
    if (!currentTeam || !formData.name) {
      toast({
        title: "Erro",
        description: "O nome da equipe é obrigatório",
        variant: "destructive",
      })
      return
    }

    const updatedTeam = {
      name: formData.name,
      description: formData.description,
      manager_id: formData.manager_id || null,
      updated_at: new Date().toISOString(),
    }

    const success = await updateTeam(currentTeam.id, updatedTeam)
    if (success) {
      setIsEditDialogOpen(false)
      setCurrentTeam(null)
      loadTeams(companyId)
    }
  }

  const handleDeleteTeam = async () => {
    if (!currentTeam) return

    const success = await deleteTeam(currentTeam.id)
    if (success) {
      setIsDeleteDialogOpen(false)
      setCurrentTeam(null)
      loadTeams(companyId)
    }
  }

  const openEditDialog = (team: TeamWithManager) => {
    setCurrentTeam(team)
    setFormData({
      name: team.name,
      description: team.description || "",
      manager_id: team.manager_id || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (team: TeamWithManager) => {
    setCurrentTeam(team)
    setIsDeleteDialogOpen(true)
  }

  const displayedTeams = teams.length > 0 ? teams : initialTeams

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Equipes</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Equipe
        </Button>
      </div>

      {loading && displayedTeams.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : displayedTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-center mb-2">Nenhuma equipe encontrada</p>
            <p className="text-sm text-gray-500 text-center mb-4">
              Crie sua primeira equipe para começar a organizar seus funcionários
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Equipe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    {team.manager && <CardDescription>Gestor: {team.manager.full_name}</CardDescription>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(team)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(team)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {team.description ? (
                  <p className="text-sm text-gray-500">{team.description}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sem descrição</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/teams/${team.id}`)}>
                  <Users className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Criação de Equipe */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Equipe</DialogTitle>
            <DialogDescription>Crie uma nova equipe para organizar seus funcionários</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Equipe *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Desenvolvimento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o propósito desta equipe"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Gestor</Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
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
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTeam}>Criar Equipe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Gestor</Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
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
              Tem certeza que deseja excluir a equipe "{currentTeam?.name}"? Esta ação não pode ser desfeita.
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
    </div>
  )
}

