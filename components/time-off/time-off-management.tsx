"use client"

/**
 * Componente de gestão de férias e ausências
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { CalendarPlus, Search, Filter, CheckCircle, XCircle, Calendar } from "lucide-react"
import TimeOffRequestDialog from "./time-off-request-dialog"
import TimeOffDetailsDialog from "./time-off-details-dialog"

/**
 * Props para o componente TimeOffManagement
 */
interface TimeOffManagementProps {
  timeOffs: any[]
  employees: any[]
  currentEmployeeId: string
  isAdmin: boolean
}

/**
 * Componente de gestão de férias e ausências
 * @param timeOffs Lista de solicitações de férias e ausências
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de gestão de férias e ausências
 */
export default function TimeOffManagement({ timeOffs, employees, currentEmployeeId, isAdmin }: TimeOffManagementProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedTimeOff, setSelectedTimeOff] = useState<any>(null)
  const [employeeFilter, setEmployeeFilter] = useState<string>(isAdmin ? "all" : currentEmployeeId)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * Filtra as solicitações com base nos filtros selecionados
   * @returns Lista de solicitações filtrada
   */
  const filteredTimeOffs = timeOffs.filter((timeOff) => {
    // Filtro por funcionário
    if (employeeFilter !== "all" && timeOff.employee_id !== employeeFilter) {
      return false
    }

    // Filtro por status
    if (statusFilter !== "all" && timeOff.status !== statusFilter) {
      return false
    }

    // Filtro por tipo
    if (typeFilter !== "all" && timeOff.type !== typeFilter) {
      return false
    }

    // Filtro por busca (motivo)
    if (searchQuery && timeOff.reason) {
      const query = searchQuery.toLowerCase()
      return (
        timeOff.reason.toLowerCase().includes(query) ||
        (timeOff.employees?.full_name && timeOff.employees.full_name.toLowerCase().includes(query))
      )
    }

    return true
  })

  /**
   * Abre o diálogo de detalhes da solicitação
   * @param timeOff Solicitação a ser visualizada
   */
  const handleViewTimeOff = (timeOff: any) => {
    setSelectedTimeOff(timeOff)
    setIsDetailsDialogOpen(true)
  }

  /**
   * Aprova uma solicitação (apenas para admin)
   * @param timeOffId ID da solicitação a ser aprovada
   */
  const handleApproveTimeOff = async (timeOffId: string) => {
    try {
      const { error } = await supabase
        .from("time_off")
        .update({
          status: "approved",
          approved_by: currentEmployeeId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", timeOffId)

      if (error) {
        throw error
      }

      // Atualiza o status do funcionário se for férias
      const timeOff = timeOffs.find((t) => t.id === timeOffId)
      if (timeOff && timeOff.type === "vacation") {
        const { error: updateError } = await supabase
          .from("employees")
          .update({ status: "vacation" })
          .eq("id", timeOff.employee_id)

        if (updateError) {
          throw updateError
        }
      }

      toast({
        title: "Solicitação aprovada",
        description: "A solicitação foi aprovada com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao aprovar solicitação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao aprovar a solicitação.",
      })
    }
  }

  /**
   * Rejeita uma solicitação (apenas para admin)
   * @param timeOffId ID da solicitação a ser rejeitada
   */
  const handleRejectTimeOff = async (timeOffId: string) => {
    try {
      const { error } = await supabase
        .from("time_off")
        .update({
          status: "rejected",
          approved_by: currentEmployeeId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", timeOffId)

      if (error) {
        throw error
      }

      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação foi rejeitada com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar solicitação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao rejeitar a solicitação.",
      })
    }
  }

  /**
   * Obtém a cor do badge com base no status
   * @param status Status da solicitação
   * @returns Classe CSS para o badge
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Obtém a cor do badge com base no tipo
   * @param type Tipo da solicitação
   * @returns Classe CSS para o badge
   */
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "vacation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "sick_leave":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "maternity_leave":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
      case "paternity_leave":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
      case "bereavement":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      case "personal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Traduz o status da solicitação para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateTimeOffStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    }

    return statusMap[status] || status
  }

  /**
   * Traduz o tipo da solicitação para português
   * @param type Tipo em inglês
   * @returns Tipo traduzido
   */
  const translateTimeOffType = (type: string) => {
    const typeMap: Record<string, string> = {
      vacation: "Férias",
      sick_leave: "Licença Médica",
      maternity_leave: "Licença Maternidade",
      paternity_leave: "Licença Paternidade",
      bereavement: "Licença Luto",
      personal: "Licença Pessoal",
      other: "Outro",
    }

    return typeMap[type] || type
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Solicitações de Férias e Ausências</CardTitle>
              <CardDescription>Total de {filteredTimeOffs.length} solicitações</CardDescription>
            </div>
            <Button onClick={() => setIsRequestDialogOpen(true)}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por motivo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="sick_leave">Licença Médica</SelectItem>
                  <SelectItem value="maternity_leave">Licença Maternidade</SelectItem>
                  <SelectItem value="paternity_leave">Licença Paternidade</SelectItem>
                  <SelectItem value="bereavement">Licença Luto</SelectItem>
                  <SelectItem value="personal">Licença Pessoal</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os funcionários</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Funcionário</TableHead>}
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeOffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                      Nenhuma solicitação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTimeOffs.map((timeOff) => (
                    <TableRow key={timeOff.id}>
                      {isAdmin && <TableCell>{timeOff.employees?.full_name}</TableCell>}
                      <TableCell>
                        <Badge className={getTypeBadgeVariant(timeOff.type)}>
                          {translateTimeOffType(timeOff.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(timeOff.start_date)} a {formatDate(timeOff.end_date)}
                      </TableCell>
                      <TableCell>{timeOff.total_days} dias</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(timeOff.status)}>
                          {translateTimeOffStatus(timeOff.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(timeOff.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewTimeOff(timeOff)}
                            title="Detalhes"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          {isAdmin && timeOff.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleApproveTimeOff(timeOff.id)}
                                className="text-green-600"
                                title="Aprovar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRejectTimeOff(timeOff.id)}
                                className="text-red-600"
                                title="Rejeitar"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TimeOffRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        employees={employees}
        currentEmployeeId={currentEmployeeId}
        isAdmin={isAdmin}
      />

      <TimeOffDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        timeOff={selectedTimeOff}
      />
    </>
  )
}

