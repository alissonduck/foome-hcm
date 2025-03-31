import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeeRole } from "@/lib/types/employee-role"
import { Pencil, Trash2 } from "lucide-react"

interface EmployeeRoleListProps {
  roles: EmployeeRole[]
  onEdit: (role: EmployeeRole) => void
  onDelete: (id: string) => void
}

export function EmployeeRoleList({
  roles,
  onEdit,
  onDelete,
}: EmployeeRoleListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cargo</TableHead>
            <TableHead>Data de Início</TableHead>
            <TableHead>Data de Término</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.role.name}</TableCell>
              <TableCell>
                {format(new Date(role.start_date), "PPP", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {role.end_date
                  ? format(new Date(role.end_date), "PPP", { locale: ptBR })
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={role.is_current ? "default" : "secondary"}
                >
                  {role.is_current ? "Atual" : "Histórico"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {role.notes || "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 