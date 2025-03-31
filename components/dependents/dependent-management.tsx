"use client"

/**
 * Componente de gerenciamento de dependentes
 * Fornece funcionalidade completa para listar, adicionar, editar e excluir dependentes
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useDependents } from "@/hooks/use-dependents"
import { DependentList } from "@/components/dependents/dependent-list"
import { DependentDialog } from "@/components/dependents/dependent-dialog"
import { EmployeeDependent } from "@/lib/types/documents"
import { DependentFormValues } from "@/lib/schemas/dependent-schema"
import { Plus } from "lucide-react"
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

/**
 * Props para o componente DependentManagement
 */
interface DependentManagementProps {
  employeeId: string
}

/**
 * Componente para gerenciar dependentes
 * @param employeeId ID do funcionário
 * @returns Componente de gerenciamento de dependentes
 */
export function DependentManagement({ employeeId }: DependentManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentDependent, setCurrentDependent] = useState<EmployeeDependent | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const { 
    dependents, 
    isLoading, 
    createDependent, 
    updateDependent, 
    deleteDependent, 
    isCreating, 
    isUpdating, 
    isDeleting,
    translateRelationship,
    translateGender
  } = useDependents(employeeId)
  
  // Abre o diálogo para adicionar um novo dependente
  const handleAddDependent = () => {
    setCurrentDependent(undefined)
    setDialogOpen(true)
  }
  
  // Abre o diálogo para editar um dependente existente
  const handleEditDependent = (dependent: EmployeeDependent) => {
    setCurrentDependent(dependent)
    setDialogOpen(true)
  }
  
  // Abre o diálogo de confirmação para excluir um dependente
  const handleDeleteClick = (dependentId: string) => {
    setDeletingId(dependentId)
  }
  
  // Confirma a exclusão do dependente
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteDependent(deletingId)
      setDeletingId(null)
    }
  }
  
  // Cancela a exclusão do dependente
  const handleCancelDelete = () => {
    setDeletingId(null)
  }
  
  // Lida com o envio do formulário de dependente
  const handleSubmit = (values: DependentFormValues & { employee_id?: string }) => {
    if (currentDependent) {
      updateDependent(currentDependent.id, values)
    } else {
      createDependent(values)
    }
    setDialogOpen(false)
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Dependentes</CardTitle>
          <CardDescription>
            Gerencie os dependentes do funcionário
          </CardDescription>
        </div>
        <Button onClick={handleAddDependent} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground">
            Carregando dependentes...
          </div>
        ) : (
          <DependentList
            dependents={dependents}
            onEdit={handleEditDependent}
            onDelete={handleDeleteClick}
            translateRelationship={translateRelationship}
            translateGender={translateGender}
          />
        )}
        
        {/* Diálogo para adicionar/editar dependente */}
        <DependentDialog
          employeeId={employeeId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          currentDependent={currentDependent}
          isSubmitting={isCreating || isUpdating}
        />
        
        {/* Diálogo de confirmação para excluir dependente */}
        <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este dependente? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
} 