"use client"

/**
 * Componente de lista de dependentes
 * Exibe uma tabela com a lista de dependentes de um funcionário
 */
import { 
  EmployeeDependent, 
  DependentGender, 
  DependentRelationship 
} from "@/lib/types/documents"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

/**
 * Props para o componente DependentList
 */
interface DependentListProps {
  dependents: EmployeeDependent[]
  onEdit: (dependent: EmployeeDependent) => void
  onDelete: (dependentId: string) => void
  translateRelationship?: (relationship: DependentRelationship) => string
  translateGender?: (gender: DependentGender) => string
}

/**
 * Lista de dependentes em formato de tabela
 * @param dependents Lista de dependentes
 * @param onEdit Função chamada ao editar um dependente
 * @param onDelete Função chamada ao excluir um dependente
 * @param translateRelationship Função para traduzir o tipo de relação
 * @param translateGender Função para traduzir o gênero
 * @returns Componente de lista de dependentes
 */
export function DependentList({
  dependents,
  onEdit,
  onDelete,
  translateRelationship = (r) => r,
  translateGender = (g) => g,
}: DependentListProps) {
  if (!dependents || dependents.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Nenhum dependente cadastrado.
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data de Nascimento</TableHead>
            <TableHead>Parentesco</TableHead>
            <TableHead>Gênero</TableHead>
            <TableHead>Características</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dependents.map((dependent) => (
            <TableRow key={dependent.id}>
              <TableCell className="font-medium">{dependent.full_name}</TableCell>
              <TableCell>
                {dependent.birth_date
                  ? format(new Date(dependent.birth_date), "dd/MM/yyyy", { locale: pt })
                  : "N/A"}
              </TableCell>
              <TableCell>{translateRelationship(dependent.relationship)}</TableCell>
              <TableCell>{translateGender(dependent.gender)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {dependent.has_disability && (
                    <Badge variant="secondary">PCD</Badge>
                  )}
                  {dependent.is_student && (
                    <Badge variant="outline">Estudante</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(dependent)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(dependent.id)}
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