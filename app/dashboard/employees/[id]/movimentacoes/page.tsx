"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeRoleDialog } from "@/components/employees/employee-role-dialog"
import { EmployeeRoleList } from "@/components/employees/employee-role-list"
import { useEmployeeRoles } from "@/hooks/use-employee-role"
import { useRoles } from "@/hooks/use-roles"
import { EmployeeRole } from "@/lib/types/employee-role"
import { useToast } from "@/components/ui/use-toast"
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

interface MovimentacoesPageProps {
  params: {
    id: string
  }
}

export default function MovimentacoesPage({ params }: MovimentacoesPageProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<EmployeeRole | null>(null)

  const { roles, currentRole, isLoading, createRole, updateRole, deleteRole, isCreating, isUpdating, isDeleting } = useEmployeeRoles(params.id)
  const { useRolesQuery } = useRoles()
  const { data: availableRoles } = useRolesQuery(params.id)

  const handleCreate = (data: any) => {
    createRole(data)
    setIsDialogOpen(false)
  }

  const handleEdit = (role: EmployeeRole) => {
    setSelectedRole(role)
    setIsDialogOpen(true)
  }

  const handleUpdate = (data: any) => {
    if (selectedRole) {
      updateRole({ id: selectedRole.id, input: data })
      setIsDialogOpen(false)
      setSelectedRole(null)
    }
  }

  const handleDelete = (id: string) => {
    const role = roles?.find((r) => r.id === id)
    if (role) {
      setRoleToDelete(role)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.id)
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Movimentações de Cargo</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {currentRole && (
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Cargo Atual</h3>
          <p className="text-sm text-muted-foreground">
            {currentRole.role.name} - Desde{" "}
            {new Date(currentRole.start_date).toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}

      {roles && roles.length > 0 ? (
        <EmployeeRoleList
          roles={roles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="text-center text-muted-foreground">
          Nenhuma movimentação registrada.
        </div>
      )}

      <EmployeeRoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={selectedRole ? handleUpdate : handleCreate}
        roles={availableRoles || []}
        employeeId={params.id}
        currentRole={selectedRole}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 