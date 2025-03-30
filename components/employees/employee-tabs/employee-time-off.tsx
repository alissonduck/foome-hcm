"use client"

/**
 * Componente de férias e ausências do funcionário
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { CalendarPlus, Calendar, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import TimeOffRequestDialog from "@/components/time-off/time-off-request-dialog"
import TimeOffDetailsDialog from "@/components/time-off/time-off-details-dialog"

/**
 * Props para o componente EmployeeTimeOff
 */
interface EmployeeTimeOffProps {
  timeOffs: any[]
  employeeId: string
  isAdmin: boolean
}

/**
 * Componente de férias e ausências do funcionário
 * @param timeOffs Lista de férias e ausências
 * @param employeeId ID do funcionário
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de férias e ausências
 */
export default function EmployeeTimeOff({ timeOffs, employeeId, isAdmin }: EmployeeTimeOffProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedTimeOff, setSelectedTimeOff] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

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
          approved_by: employeeId,
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
        title: "solicitação aprovada",
        description: "a solicitação foi aprovada com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao aprovar solicitação",
        description: error instanceof Error ? error.message : "ocorreu um erro ao aprovar a solicitação.",
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
          approved_by: employeeId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", timeOffId)

      if (error) {
        throw error
      }

      toast({
        title: "solicitação rejeitada",
        description: "a solicitação foi rejeitada com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao rejeitar solicitação",
        description: error instanceof Error ? error.message : "ocorreu um erro ao rejeitar a solicitação.",
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
      pending: "pendente",
      approved: "aprovado",
      rejected: "rejeitado",
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
      vacation: "férias",
      sick_leave: "licença médica",
      maternity_leave: "licença maternidade",
      paternity_leave: "licença paternidade",
      bereavement: "licença luto",
      personal: "licença pessoal",
      other: "outro",
    }

    return typeMap[type] || type
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">férias e ausências</h3>
        <Button size="sm" onClick={() => setIsRequestDialogOpen(true)}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          nova solicitação
        </Button>
      </div>

      {timeOffs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">nenhuma solicitação de férias ou ausência encontrada.</p>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              criar primeira solicitação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>tipo</TableHead>
                <TableHead>período</TableHead>
                <TableHead>dias</TableHead>
                <TableHead>status</TableHead>
                <TableHead>data da solicitação</TableHead>
                <TableHead className="text-right">ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeOffs.map((timeOff) => (
                <TableRow key={timeOff.id}>
                  <TableCell>
                    <Badge className={getTypeBadgeVariant(timeOff.type)}>{translateTimeOffType(timeOff.type)}</Badge>
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
                      <Button variant="outline" size="icon" onClick={() => handleViewTimeOff(timeOff)} title="detalhes">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      {isAdmin && timeOff.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproveTimeOff(timeOff.id)}
                            className="text-green-600"
                            title="aprovar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRejectTimeOff(timeOff.id)}
                            className="text-red-600"
                            title="rejeitar"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TimeOffRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        employees={[{ id: employeeId, full_name: "" }]}
        currentEmployeeId={employeeId}
        isAdmin={false}
      />

      <TimeOffDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        timeOff={selectedTimeOff}
      />
    </div>
  )
}

