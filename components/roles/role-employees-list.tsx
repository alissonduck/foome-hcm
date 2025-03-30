/**
 * Componente de lista de funcionários de um cargo
 * Exibe os funcionários atualmente atribuídos a um cargo
 */
"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRoles } from "@/hooks/use-roles"
import { AssignRoleForm } from "@/components/roles/assign-role-form"
import { EmptyState } from "@/components/empty-state"

interface RoleEmployeesListProps {
  roleId: string
}

export function RoleEmployeesList({ roleId }: RoleEmployeesListProps) {
  const { useRoleEmployeesQuery } = useRoles()
  const { data: employees, isLoading, isError } = useRoleEmployeesQuery(roleId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando funcionários...</div>
  }

  if (isError) {
    return <div className="flex justify-center p-4 text-destructive">Erro ao carregar funcionários</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Funcionários no Cargo</CardTitle>
          <CardDescription>Funcionários atualmente atribuídos a este cargo</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Atribuir Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Atribuir Funcionário ao Cargo</DialogTitle>
              <DialogDescription>Selecione um funcionário para atribuir a este cargo.</DialogDescription>
            </DialogHeader>
            <AssignRoleForm roleId={roleId} onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {employees && employees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de Início</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/employees/${employee.employee_id}`} className="hover:underline">
                      {employee.employee.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{employee.employee.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(employee.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Nenhum funcionário atribuído"
            description="Este cargo ainda não possui funcionários atribuídos."
            action={
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Atribuir Funcionário
                </Button>
              </DialogTrigger>
            }
          />
        )}
      </CardContent>
    </Card>
  )
}

