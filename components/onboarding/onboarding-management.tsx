"use client"

/**
 * Componente de gestão de onboarding
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ListChecks, Search, Filter, CheckCircle, XCircle, Plus, Settings, ClipboardList } from "lucide-react"
import OnboardingTaskDialog from "./onboarding-task-dialog"
import OnboardingAssignDialog from "./onboarding-assign-dialog"
import OnboardingDetailsDialog from "./onboarding-details-dialog"
import { updateOnboardingStatus, deleteTask } from "@/server/actions/onboarding-actions"

/**
 * Props para o componente OnboardingManagement
 */
interface OnboardingManagementProps {
  onboardings: any[]
  tasks: any[]
  employees: any[]
  currentEmployeeId: string
  companyId: string
  isAdmin: boolean
}

/**
 * Componente de gestão de onboarding
 * @param onboardings Lista de onboardings
 * @param tasks Lista de tarefas
 * @param employees Lista de funcionários
 * @param currentEmployeeId ID do funcionário atual
 * @param companyId ID da empresa
 * @param isAdmin Indica se o usuário é administrador
 * @returns Componente de gestão de onboarding
 */
export default function OnboardingManagement({
  onboardings,
  tasks,
  employees,
  currentEmployeeId,
  companyId,
  isAdmin,
}: OnboardingManagementProps) {
  const [activeTab, setActiveTab] = useState("tasks")
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedOnboarding, setSelectedOnboarding] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [employeeFilter, setEmployeeFilter] = useState<string>(isAdmin ? "all" : currentEmployeeId)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  /**
   * Filtra os onboardings com base nos filtros selecionados
   * @returns Lista de onboardings filtrada
   */
  const filteredOnboardings = onboardings.filter((onboarding) => {
    // Filtro por funcionário
    if (employeeFilter !== "all" && onboarding.employee_id !== employeeFilter) {
      return false
    }

    // Filtro por status
    if (statusFilter !== "all" && onboarding.status !== statusFilter) {
      return false
    }

    // Filtro por busca (nome da tarefa ou funcionário)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        (onboarding.onboarding_tasks?.name && onboarding.onboarding_tasks.name.toLowerCase().includes(query)) ||
        (onboarding.employees?.full_name && onboarding.employees.full_name.toLowerCase().includes(query))
      )
    }

    return true
  })

  /**
   * Abre o diálogo de detalhes do onboarding
   * @param onboarding Onboarding a ser visualizado
   */
  const handleViewOnboarding = (onboarding: any) => {
    setSelectedOnboarding(onboarding)
    setIsDetailsDialogOpen(true)
  }

  /**
   * Abre o diálogo de edição de tarefa
   * @param task Tarefa a ser editada
   */
  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  /**
   * Completa uma tarefa de onboarding
   * @param onboardingId ID do onboarding a ser completado
   */
  const handleCompleteTask = async (onboardingId: string) => {
    try {
      const result = await updateOnboardingStatus(onboardingId, "completed")
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Tarefa concluída",
        description: "A tarefa foi marcada como concluída com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao concluir tarefa",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao concluir a tarefa.",
      })
    }
  }

  /**
   * Exclui uma tarefa de onboarding
   * @param taskId ID da tarefa a ser excluída
   */
  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tarefa",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a tarefa.",
      })
    }
  }

  /**
   * Obtém a cor do badge com base no status
   * @param status Status do onboarding
   * @returns Classe CSS para o badge
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  /**
   * Traduz o status do onboarding para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateOnboardingStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      completed: "Concluído",
    }

    return statusMap[status] || status
  }

  /**
   * Traduz a categoria da tarefa para português
   * @param category Categoria em inglês
   * @returns Categoria traduzida
   */
  const translateTaskCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      documentation: "Documentação",
      training: "Treinamento",
      system_access: "Acesso a Sistemas",
      equipment: "Equipamentos",
      introduction: "Introdução",
      other: "Outro",
    }

    return categoryMap[category] || category
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tasks">
              <Settings className="mr-2 h-4 w-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="onboarding">
              <ClipboardList className="mr-2 h-4 w-4" />
              Onboarding
            </TabsTrigger>
          </TabsList>

          {isAdmin && activeTab === "tasks" && (
            <Button
              onClick={() => {
                setSelectedTask(null)
                setIsTaskDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          )}

          {isAdmin && activeTab === "onboarding" && (
            <Button onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Atribuir Tarefas
            </Button>
          )}
        </div>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas de Onboarding</CardTitle>
              <CardDescription>Lista de tarefas disponíveis para onboarding de funcionários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Obrigatório</TableHead>
                      <TableHead>Prazo Padrão (dias)</TableHead>
                      {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                          Nenhuma tarefa encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>{translateTaskCategory(task.category)}</TableCell>
                          <TableCell>{task.is_required ? "Sim" : "Não"}</TableCell>
                          <TableCell>{task.default_due_days}</TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditTask(task)}
                                  title="Editar"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600"
                                  title="Excluir"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding de Funcionários</CardTitle>
              <CardDescription>Total de {filteredOnboardings.length} tarefas de onboarding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por tarefa, funcionário..."
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
                      <SelectItem value="completed">Concluídos</SelectItem>
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
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Conclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOnboardings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                          Nenhuma tarefa de onboarding encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOnboardings.map((onboarding) => (
                        <TableRow key={onboarding.id}>
                          {isAdmin && <TableCell>{onboarding.employees?.full_name}</TableCell>}
                          <TableCell className="font-medium">{onboarding.onboarding_tasks?.name}</TableCell>
                          <TableCell>{onboarding.due_date ? formatDate(onboarding.due_date) : "N/A"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeVariant(onboarding.status)}>
                              {translateOnboardingStatus(onboarding.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{onboarding.completed_at ? formatDate(onboarding.completed_at) : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleViewOnboarding(onboarding)}
                                title="Detalhes"
                              >
                                <ListChecks className="h-4 w-4" />
                              </Button>
                              {onboarding.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCompleteTask(onboarding.id)}
                                  className="text-green-600"
                                  title="Concluir"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
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
        </TabsContent>
      </Tabs>

      <OnboardingTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        companyId={companyId}
      />

      <OnboardingAssignDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        tasks={tasks}
        employees={employees}
        currentEmployeeId={currentEmployeeId}
        isAdmin={isAdmin}
      />

      <OnboardingDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onboarding={selectedOnboarding}
      />
    </>
  )
}

