"use client"

/**
 * Componente cliente para a página de movimentações
 * Este componente contém a lógica de interatividade da página de movimentações
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmployeeRoleDialog } from "@/components/employees/employee-role-dialog"
import { EmployeeRoleList } from "@/components/employees/employee-role-list"
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
import { createEmployeeRole, updateEmployeeRole, deleteEmployeeRole } from "@/server/actions/employee-role-actions"

interface MovimentacoesClientProps {
  employeeId: string
  initialRoles: EmployeeRole[]
  initialCurrentRole: EmployeeRole | null
}

/**
 * Componente cliente para a página de movimentações
 * @param employeeId ID do funcionário
 * @param initialRoles Lista inicial de movimentações de cargo
 * @param initialCurrentRole Cargo atual do funcionário
 * @returns Componente de movimentações de cargo
 */
export function MovimentacoesClient({ 
  employeeId, 
  initialRoles, 
  initialCurrentRole 
}: MovimentacoesClientProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<EmployeeRole | null>(null)
  const [roles, setRoles] = useState<EmployeeRole[]>(initialRoles || [])
  const [currentRole, setCurrentRole] = useState<EmployeeRole | null>(initialCurrentRole)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { useRolesQuery } = useRoles()
  const { data: availableRoles } = useRolesQuery(employeeId)

  const handleCreate = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      const result = await createEmployeeRole(data)
      
      if (result.success && result.data) {
        toast({
          title: "Movimentação registrada",
          description: "A movimentação de cargo foi registrada com sucesso.",
        })
        
        // Atualiza a lista local de movimentações
        setRoles([result.data, ...roles])
        
        // Se a nova movimentação é o cargo atual, atualiza o cargo atual
        if (result.data.is_current) {
          setCurrentRole(result.data)
        }
        
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Erro ao registrar movimentação",
          description: result.error || "Ocorreu um erro ao registrar a movimentação de cargo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao registrar movimentação",
        description: "Ocorreu um erro ao registrar a movimentação de cargo.",
        variant: "destructive",
      })
      console.error("Erro ao criar movimentação:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (role: EmployeeRole) => {
    setSelectedRole(role)
    setIsDialogOpen(true)
  }

  const handleUpdate = async (data: any) => {
    if (!selectedRole) return
    
    setIsSubmitting(true)
    
    try {
      const result = await updateEmployeeRole(selectedRole.id, data)
      
      if (result.success && result.data) {
        toast({
          title: "Movimentação atualizada",
          description: "A movimentação de cargo foi atualizada com sucesso.",
        })
        
        // Atualiza a lista local de movimentações
        setRoles(roles.map(r => r.id === selectedRole.id ? result.data : r))
        
        // Se a movimentação atualizada é o cargo atual ou foi definida como atual
        if (result.data.is_current) {
          setCurrentRole(result.data)
        } else if (currentRole && currentRole.id === selectedRole.id) {
          // Busca o novo cargo atual na lista
          const newCurrentRole = roles.find(r => r.is_current && r.id !== selectedRole.id) || null
          setCurrentRole(newCurrentRole)
        }
        
        setIsDialogOpen(false)
        setSelectedRole(null)
      } else {
        toast({
          title: "Erro ao atualizar movimentação",
          description: result.error || "Ocorreu um erro ao atualizar a movimentação de cargo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar movimentação",
        description: "Ocorreu um erro ao atualizar a movimentação de cargo.",
        variant: "destructive",
      })
      console.error("Erro ao atualizar movimentação:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    const role = roles.find((r) => r.id === id)
    if (role) {
      setRoleToDelete(role)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return
    
    setIsSubmitting(true)
    
    try {
      const result = await deleteEmployeeRole(roleToDelete.id)
      
      if (result.success) {
        toast({
          title: "Movimentação excluída",
          description: "A movimentação de cargo foi excluída com sucesso.",
        })
        
        // Atualiza a lista local de movimentações
        setRoles(roles.filter(r => r.id !== roleToDelete.id))
        
        // Se a movimentação excluída era o cargo atual
        if (currentRole && currentRole.id === roleToDelete.id) {
          // Busca o novo cargo atual na lista (o mais recente)
          const newCurrentRole = roles.find(r => r.id !== roleToDelete.id && r.is_current) || null
          setCurrentRole(newCurrentRole)
        }
        
        setIsDeleteDialogOpen(false)
        setRoleToDelete(null)
      } else {
        toast({
          title: "Erro ao excluir movimentação",
          description: result.error || "Ocorreu um erro ao excluir a movimentação de cargo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir movimentação",
        description: "Ocorreu um erro ao excluir a movimentação de cargo.",
        variant: "destructive",
      })
      console.error("Erro ao excluir movimentação:", error)
    } finally {
      setIsSubmitting(false)
    }
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
            {currentRole.role?.name || "Cargo não definido"} - Desde{" "}
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
        employeeId={employeeId}
        currentRole={selectedRole}
        isSubmitting={isSubmitting}
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
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 