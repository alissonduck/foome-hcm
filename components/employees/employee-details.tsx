"use client"

/**
 * Componente de detalhes do funcionário
 */
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/components/ui/use-toast"
import { User, Briefcase, FileText, Calendar, ClipboardList, Edit, Trash2, ArrowLeft } from "lucide-react"
import { translateEmployeeStatus, translateContractType, formatDate } from "@/lib/utils"
import { useDeleteEmployee } from "@/hooks/use-employee"
import EmployeePersonalInfo from "./employee-tabs/employee-personal-info"
import EmployeeProfessionalInfo from "./employee-tabs/employee-professional-info"
import EmployeeDocuments from "./employee-tabs/employee-documents"
import EmployeeTimeOff from "./employee-tabs/employee-time-off"
import EmployeeOnboarding from "./employee-tabs/employee-onboarding"
import EmployeeEditDialog from "./employee-edit-dialog"

/**
 * Props para o componente EmployeeDetails
 */
interface EmployeeDetailsProps {
  employee: any
  documents: any[]
  timeOffs: any[]
  onboardingTasks: any[]
  isAdmin: boolean
  currentUserId: string | undefined
  companyId: string
  extraTabs?: Array<{
    id: string
    label: string
    content: React.ReactNode
    icon?: React.ReactNode
  }>
}

/**
 * Componente de detalhes do funcionário
 * @param employee Dados do funcionário
 * @param documents Documentos do funcionário
 * @param timeOffs Férias e ausências do funcionário
 * @param onboardingTasks Tarefas de onboarding do funcionário
 * @param isAdmin Indica se o usuário é administrador
 * @param currentUserId ID do usuário atual
 * @param companyId ID da empresa associada ao funcionário
 * @param extraTabs Abas adicionais para o componente
 * @returns Componente de detalhes do funcionário
 */
export default function EmployeeDetails({
  employee,
  documents,
  timeOffs,
  onboardingTasks,
  isAdmin,
  currentUserId,
  companyId,
  extraTabs = [],
}: EmployeeDetailsProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { deleteEmployee, isDeleting } = useDeleteEmployee()

  // Efeito para verificar os dados do employee no componente
  useEffect(() => {
    console.log("EmployeeDetails montado, verificando dados:", {
      employee: employee ? "objeto existe" : "undefined/null",
      employeeId: employee?.id,
      employeeKeys: employee ? Object.keys(employee) : [],
      companyId
    });
  }, [employee, companyId]);

  // Verifica se o usuário atual é o próprio funcionário
  const isSelf = currentUserId === employee.user_id

  // Verifica se o usuário pode editar (admin ou próprio funcionário)
  const canEdit = isAdmin || isSelf

  // Verifica se o usuário pode excluir (apenas admin e não é o próprio)
  const canDelete = isAdmin && !isSelf

  /**
   * Função para lidar com a exclusão do funcionário
   */
  const handleDelete = async () => {
    try {
      await deleteEmployee(employee.id)

      toast({
        title: "funcionário excluído",
        description: "o funcionário foi excluído com sucesso.",
      })

      router.push("/dashboard/employees")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "erro ao excluir funcionário",
        description: error instanceof Error ? error.message : "ocorreu um erro ao excluir o funcionário.",
      })
    }
  }

  /**
   * Função para obter a cor do badge com base no status
   * @param status Status do funcionário
   * @returns Classe CSS para o badge
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "vacation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "terminated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "maternity_leave":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "sick_leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = () => {
    // Verificar se temos os dados necessários
    console.log("Verificando dados do funcionário para edição:", {
      employeeObj: employee,
      employeeId: employee?.id,
      companyId
    });
    
    if (!employee || !employee.id) {
      console.error("Erro: Dados do funcionário incompletos ou inválidos para edição");
      toast({
        variant: "destructive",
        title: "Erro ao abrir formulário",
        description: "Dados do funcionário inválidos ou incompletos. Tente novamente."
      });
      return;
    }
    
    if (!companyId) {
      console.error("Erro: ID da empresa não disponível para edição");
      toast({
        variant: "destructive",
        title: "Erro ao abrir formulário",
        description: "ID da empresa não encontrado. Tente novamente."
      });
      return;
    }
    
    // Se chegou aqui, temos os dados necessários para abrir o diálogo
    console.log("Abrindo diálogo de edição com dados válidos:", { 
      employeeId: employee.id, 
      companyId 
    });
    setIsEditDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">detalhes do funcionário</h1>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={handleOpenEditDialog} className="h-8">
              <Edit className="h-4 w-4 mr-2" />
              editar
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="h-8">
              <Trash2 className="h-4 w-4 mr-2" />
              excluir
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{employee.full_name}</CardTitle>
              <CardDescription>{employee.email}</CardDescription>
            </div>
            <Badge className={getStatusBadgeVariant(employee.status)}>{translateEmployeeStatus(employee.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">cargo</span>
              <span className="font-medium">{employee.position || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">departamento</span>
              <span className="font-medium">{employee.department || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">tipo de contrato</span>
              <span className="font-medium">{translateContractType(employee.contract_type)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">data de admissão</span>
              <span className="font-medium">
                {employee.hire_date ? formatDate(employee.hire_date) : "não informado"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">telefone</span>
              <span className="font-medium">{employee.phone || "não informado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">cadastrado em</span>
              <span className="font-medium">{formatDate(employee.created_at)}</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid mb-6" style={{ gridTemplateColumns: `repeat(${5 + extraTabs.length}, minmax(0, 1fr))` }}>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">dados pessoais</span>
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">dados profissionais</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">documentos</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {documents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="timeoff" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">férias e ausências</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {timeOffs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">onboarding</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {onboardingTasks.length}
                </Badge>
              </TabsTrigger>
              {extraTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal">
              <EmployeePersonalInfo employee={employee} />
            </TabsContent>

            <TabsContent value="professional">
              <EmployeeProfessionalInfo employee={employee} />
            </TabsContent>

            <TabsContent value="documents">
              <EmployeeDocuments documents={documents} employeeId={employee.id} isAdmin={isAdmin} />
            </TabsContent>

            <TabsContent value="timeoff">
              <EmployeeTimeOff timeOffs={timeOffs} employeeId={employee.id} isAdmin={isAdmin} />
            </TabsContent>

            <TabsContent value="onboarding">
              <EmployeeOnboarding onboardingTasks={onboardingTasks} employeeId={employee.id} isAdmin={isAdmin} />
            </TabsContent>
            
            {extraTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>excluir funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              tem certeza que deseja excluir este funcionário? esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "excluindo..." : "excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de edição */}
      <EmployeeEditDialog 
        employee={employee} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        companyId={companyId} 
      />
    </div>
  )
}

