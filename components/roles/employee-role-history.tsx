/**
 * Componente de histórico de cargos de um funcionário
 * Exibe o histórico de cargos de um funcionário
 */
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, BriefcaseIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useRoles } from "@/hooks/use-roles"
import { AssignRoleForm } from "@/components/roles/assign-role-form"
import { EmptyState } from "@/components/empty-state"

interface EmployeeRoleHistoryProps {
  employeeId: string
}

export function EmployeeRoleHistory({ employeeId }: EmployeeRoleHistoryProps) {
  const { useEmployeeRoleHistoryQuery } = useRoles()
  const { data: roleHistory, isLoading, isError } = useEmployeeRoleHistoryQuery(employeeId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando histórico de cargos...</div>
  }

  if (isError) {
    return <div className="flex justify-center p-4 text-destructive">Erro ao carregar histórico de cargos</div>
  }

  const currentRole = roleHistory?.find((role) => role.is_current)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Histórico de Cargos</CardTitle>
          <CardDescription>Cargos ocupados pelo funcionário</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Atribuir Cargo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Atribuir Cargo ao Funcionário</DialogTitle>
              <DialogDescription>Selecione um cargo para atribuir a este funcionário.</DialogDescription>
            </DialogHeader>
            <AssignRoleForm employeeId={employeeId} onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {roleHistory && roleHistory.length > 0 ? (
          <div className="space-y-4">
            {currentRole && (
              <div className="mb-6 rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Cargo Atual</h3>
                  <Badge variant="default">Atual</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                    <p className="font-medium">{currentRole.role.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Contrato</p>
                    <p className="font-medium capitalize">{currentRole.role.contract_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                    <p className="flex items-center font-medium">
                      <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                      {format(new Date(currentRole.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <h3 className="mb-2 font-medium">Histórico Completo</h3>
            <div className="space-y-4">
              {roleHistory.map((role) => (
                <div
                  key={role.id}
                  className="flex flex-col rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h4 className="font-medium">{role.role.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{role.role.contract_type}</p>
                  </div>
                  <div className="mt-2 flex flex-col items-start gap-1 sm:mt-0 sm:items-end">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                      Início: {format(new Date(role.start_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    {role.end_date && (
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                        Término: {format(new Date(role.end_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                    {role.is_current && <Badge variant="outline">Atual</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Nenhum cargo atribuído"
            description="Este funcionário ainda não possui cargos atribuídos."
            action={
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Atribuir Cargo
                </Button>
              </DialogTrigger>
            }
          />
        )}
      </CardContent>
    </Card>
  )
}

