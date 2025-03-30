/**
 * Componente para exibir detalhes de uma subequipe
 * Mostra informações da subequipe e seus membros
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useTeams } from "@/hooks/use-teams"
import type { SubteamWithMembers, SubteamUpdate, SubteamMemberInsert } from "@/lib/types/teams"
import { Users, UserPlus, Pencil, Trash2, UserMinus, ArrowLeft } from "lucide-react"

interface SubteamDetailsProps {
  subteamId: string
  initialSubteam?: SubteamWithMembers
  employees: Array<{
    id: string
    full_name: string
    position?: string | null
  }>
}

export function SubteamDetails({ subteamId, initialSubteam, employees }: SubteamDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const {
    loading,
    currentSubteam,
    loadSubteamDetails,
    updateSubteam,
    deleteSubteam,
    addSubteamMember,
    removeSubteamMember,
  } = useTeams()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager_id: "",
  })

  useEffect(() => {
    if (initialSubteam) {
      // Se temos dados iniciais, usamos eles
    } else {
      // Caso contrário, carregamos do servidor
      loadSubteamDetails(subteamId)
    }
  }, [subteamId, initialSubteam, loadSubteamDetails])

  useEffect(() => {
    if (currentSubteam) {
      setFormData({
        name: currentSubteam.name,
        description: currentSubteam.description || "",
        manager_id: currentSubteam.manager_id || "",
      })
    }
  }, [currentSubteam])

  const handleEditSubteam = async () => {
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "O nome da subequipe é obrigatório",
        variant: "destructive",
      })
      return
    }

    const updatedSubteam: SubteamUpdate = {
      name: formData.name,
      description: formData.description,
      manager_id: formData.manager_id || null,
      updated_at: new Date().toISOString(),
    }

    const success = await updateSubteam(subteamId, updatedSubteam)
    if (success) {
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteSubteam = async () => {
    const subteam = currentSubteam || initialSubteam
    if (!subteam) return

    const success = await deleteSubteam(subteamId, subteam.team_id)
    if (success) {
      setIsDeleteDialogOpen(false)
      router.push(`/dashboard/teams/${subteam.team_id}`)
    }
  }

  const handleAddMember = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário para adicionar à subequipe",
        variant: "destructive",
      })
      return
    }

    const subteamMember: SubteamMemberInsert = {
      subteam_id: subteamId,
      employee_id: selectedEmployeeId,
      joined_at: new Date().toISOString(),
    }

    const success = await addSubteamMember(subteamMember)
    if (success) {
      setIsAddMemberDialogOpen(false)
      setSelectedEmployeeId("")
    }
  }

  const handleRemoveMember = async (employeeId: string) => {
    const success = await removeSubteamMember(subteamId, employeeId)
    if (success) {
      // Membro removido com sucesso
    }
  }

  // Filtra funcionários que ainda não são membros da subequipe
  const availableEmployees = employees.filter((employee) => {
    if (!currentSubteam && !initialSubteam) return true
    const subteam = currentSubteam || initialSubteam
    return !subteam.members.some((member) => member.id === employee.id)
  })

  const subteam = currentSubteam || initialSubteam

  if (!subteam && loading) {
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
        <div className="mt-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!subteam) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-lg font-medium text-center mb-2">Subequipe não encontrada</p>
        <Button onClick={() => router.push("/dashboard/teams")}>Voltar para Equipes</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-4 flex items-center text-gray-500 hover:text-gray-900"
            onClick={() => router.push(`/dashboard/teams/${subteam.team_id}`)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para a equipe
          </Button>
          <h2 className="text-2xl font-bold">{subteam.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Subequipe
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Subequipe
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Subequipe</CardTitle>
          {subteam.manager && (
            <CardDescription>
              Gestor: {subteam.manager.full_name} {subteam.manager.position ? `(${subteam.manager.position})` : ""}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {subteam.description ? <p>{subteam.description}</p> : <p className="text-gray-400 italic">Sem descrição</p>}
        </CardContent>
      </Card>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Membros da Subequipe</h3>
          <Button onClick={() => setIsAddMemberDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Membro
          </Button>
        </div>

        {subteam.members.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-center mb-2">Nenhum membro nesta subequipe</p>
              <p className="text-sm text-gray-500 text-center mb-4">
                Adicione funcionários para começar a formar sua subequipe
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
                {subteam.members.map((member) => (
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
      </div>

      {/* Dialog de Edição de Subequipe */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Subequipe</DialogTitle>
            <DialogDescription>Atualize as informações da subequipe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Subequipe *</Label>
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
                  <SelectItem value="">Nenhum</SelectItem>
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
            <Button onClick={handleEditSubteam}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Subequipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a subequipe "{subteam.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteSubteam}>
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
            <DialogDescription>Adicione um funcionário à subequipe</DialogDescription>
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
                    <SelectItem value="no-employees" disabled>
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
    </div>
  )
}

