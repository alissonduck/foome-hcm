"use client"

/**
 * Componente de listagem de funcionários
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { EmployeeStatus, translateEmployeeStatus, translateContractType, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, Filter } from "lucide-react"

/**
 * Props para o componente EmployeeList
 */
interface EmployeeListProps {
  employees: any[] | null
  isAdmin: boolean
}

/**
 * Componente de listagem de funcionários
 * @param employees Lista de funcionários
 * @param isAdmin Indica se o usuário é administrador
 * @returns Listagem de funcionários com filtros
 */
export default function EmployeeList({ employees = [], isAdmin }: EmployeeListProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
  // Garantir que employees seja sempre um array
  const employeeArray = Array.isArray(employees) ? employees : [];

  /**
   * Filtra os funcionários com base nos filtros selecionados
   * @returns Lista de funcionários filtrada
   */
  const filteredEmployees = employeeArray.filter((employee) => {
    // Filtro por status
    if (statusFilter !== "all" && employee.status !== statusFilter) {
      return false
    }

    // Filtro por busca (nome, email, departamento ou cargo)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        employee.full_name?.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) ||
        (employee.department && employee.department.toLowerCase().includes(query)) ||
        (employee.position && employee.position.toLowerCase().includes(query))
      )
    }

    return true
  })

  /**
   * Obtém a cor do badge com base no status
   * @param status Status do funcionário
   * @returns Classe CSS para o badge
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case EmployeeStatus.VACATION:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case EmployeeStatus.TERMINATED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case EmployeeStatus.MATERNITY_LEAVE:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case EmployeeStatus.SICK_LEAVE:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Navega para a página de detalhes do funcionário
   * @param id ID do funcionário
   */
  const handleEmployeeClick = (id: string) => {
    router.push(`/dashboard/employees/${id}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>lista de funcionários</CardTitle>
            <CardDescription>total de {filteredEmployees.length} funcionários</CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={() => router.push("/dashboard/employees/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              novo funcionário
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="buscar por nome, email, cargo..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">todos os status</SelectItem>
                <SelectItem value={EmployeeStatus.ACTIVE}>ativos</SelectItem>
                <SelectItem value={EmployeeStatus.VACATION}>em férias</SelectItem>
                <SelectItem value={EmployeeStatus.TERMINATED}>desligados</SelectItem>
                <SelectItem value={EmployeeStatus.MATERNITY_LEAVE}>licença maternidade</SelectItem>
                <SelectItem value={EmployeeStatus.SICK_LEAVE}>licença saúde</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>nome</TableHead>
                <TableHead>departamento</TableHead>
                <TableHead>cargo</TableHead>
                <TableHead>contrato</TableHead>
                <TableHead>data de admissão</TableHead>
                <TableHead>status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEmployeeClick(employee.id)}
                  >
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell>{employee.department || "-"}</TableCell>
                    <TableCell>{employee.position || "-"}</TableCell>
                    <TableCell>{translateContractType(employee.contract_type)}</TableCell>
                    <TableCell>{employee.hire_date ? formatDate(employee.hire_date) : "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeVariant(employee.status)}>
                        {translateEmployeeStatus(employee.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

