"use client"

/**
 * Diálogo para edição de funcionário
 */
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { EmployeeStatus } from "@/lib/types"
import { FormattedInput } from "@/components/ui/formatted-input"

// Interfaces para as tabelas relacionadas
interface Team {
  id: string
  name: string
}

interface Subteam {
  id: string
  name: string
  team_id: string
}

interface Role {
  id: string
  title: string
  description?: string
}

interface TeamMember {
  id: string
  team_id: string
  employee_id: string
}

interface SubteamMember {
  id: string
  subteam_id: string
  employee_id: string
}

interface EmployeeRole {
  id: string
  role_id: string
  employee_id: string
}

/**
 * Props para o componente EmployeeEditDialog
 */
interface EmployeeEditDialogProps {
  employee: any
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
}

/**
 * Schema de validação para o formulário de edição
 */
const formSchema = z.object({
  // Dados pessoais
  fullName: z.string().min(3, {
    message: "O nome completo deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "Digite um e-mail válido.",
  }),
  phone: z.string().min(10, {
    message: "Digite um telefone válido.",
  }),
  status: z.string(),

  // Dados profissionais
  teamId: z.string().optional(),
  subteamId: z.string().optional(),
  roleId: z.string().min(1, {
    message: "Selecione um cargo.",
  }),
})

/**
 * Componente de diálogo para edição de funcionário
 * @param employee Dados do funcionário
 * @param open Estado de abertura do diálogo
 * @param onOpenChange Função para alterar o estado de abertura
 * @returns Diálogo para edição de funcionário
 */
export default function EmployeeEditDialog({ employee, open, onOpenChange, companyId }: EmployeeEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [teams, setTeams] = useState<Team[]>([])
  const [subteams, setSubteams] = useState<Subteam[]>([])
  const [filteredSubteams, setFilteredSubteams] = useState<Subteam[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [employeeTeam, setEmployeeTeam] = useState<TeamMember | null>(null)
  const [employeeSubteam, setEmployeeSubteam] = useState<SubteamMember | null>(null)
  const [employeeRole, setEmployeeRole] = useState<EmployeeRole | null>(null)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingSubteams, setLoadingSubteams] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loadingRelations, setLoadingRelations] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      status: "",
      teamId: "none",
      subteamId: "none",
      roleId: "",
    },
  })

  // Função para carregar os relacionamentos do funcionário usando useCallback
  const loadEmployeeRelations = useCallback(async (employeeId: string) => {
    // Verificar se employeeId e companyId são válidos
    if (!employeeId || employeeId === "undefined" || employeeId === "null" || !companyId) {
      console.error('employeeId ou companyId inválidos:', { 
        employeeId: employeeId || "undefined/null", 
        companyId: companyId || "undefined/null",
        employeeIdType: typeof employeeId,
        companyIdType: typeof companyId
      });
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Identificadores inválidos para buscar dados relacionados."
      });
      setLoadingRelations(false);
      return;
    }

    console.log("Iniciando carregamento de relacionamentos com valores válidos:", {
      employeeId,
      companyId
    });

    setLoadingRelations(true)
    try {
      // Carrega o time do funcionário
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle()
      
      if (teamError) throw teamError
      console.log("Time do funcionário:", teamData);
      setEmployeeTeam(teamData)
      if (teamData) {
        form.setValue("teamId", teamData.team_id)
      }

      // Carrega a subequipe do funcionário
      const { data: subteamData, error: subteamError } = await supabase
        .from('subteam_members')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle()
      
      if (subteamError) throw subteamError
      console.log("Subequipe do funcionário:", subteamData);
      setEmployeeSubteam(subteamData)
      if (subteamData) {
        form.setValue("subteamId", subteamData.subteam_id)
      }

      // Carrega o cargo principal do funcionário
      const { data: roleData, error: roleError } = await supabase
        .from('employee_roles')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId)
        .maybeSingle()
      
      if (roleError) throw roleError
      console.log("Cargo do funcionário:", roleData);
      setEmployeeRole(roleData)
      if (roleData) {
        form.setValue("roleId", roleData.role_id)
      }
    } catch (error: any) {
      console.error('Erro ao carregar relacionamentos do funcionário:', error.message || error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar todos os dados relacionados ao funcionário."
      })
    } finally {
      setLoadingRelations(false)
    }
  }, [supabase, toast, companyId, form])

  // Função para carregar as equipes usando useCallback
  const loadTeams = useCallback(async () => {
    // Verificar se companyId é válido
    if (!companyId) {
      console.error('companyId inválido:', companyId);
      toast({
        variant: "destructive",
        title: "Erro ao carregar equipes",
        description: "Identificador da empresa inválido."
      });
      setLoadingTeams(false);
      return;
    }

    setLoadingTeams(true)
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('company_id', companyId)
        .order('name')
      
      if (error) throw error
      setTeams(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar equipes:', error.message || error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar equipes",
        description: "Não foi possível carregar a lista de equipes."
      })
    } finally {
      setLoadingTeams(false)
    }
  }, [supabase, toast, companyId])

  // Função para carregar as subequipes usando useCallback
  const loadSubteams = useCallback(async () => {
    setLoadingSubteams(true)
    try {
      const { data, error } = await supabase
        .from('subteams')
        .select('*')
        .order('name')
      
      if (error) throw error
      setSubteams(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar subequipes:', error.message || error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar subequipes",
        description: "Não foi possível carregar a lista de subequipes."
      })
    } finally {
      setLoadingSubteams(false)
    }
  }, [supabase, toast])

  // Função para carregar os cargos usando useCallback
  const loadRoles = useCallback(async () => {
    // Verificar se companyId é válido
    if (!companyId) {
      console.error('companyId inválido:', companyId);
      toast({
        variant: "destructive",
        title: "Erro ao carregar cargos",
        description: "Identificador da empresa inválido."
      });
      setLoadingRoles(false);
      return;
    }

    setLoadingRoles(true)
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('company_id', companyId)
        .order('title')
      
      if (error) throw error
      setRoles(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar cargos:', error.message || error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar cargos",
        description: "Não foi possível carregar a lista de cargos."
      })
    } finally {
      setLoadingRoles(false)
    }
  }, [supabase, toast, companyId])

  // Filtra as subequipes quando a equipe é selecionada
  useEffect(() => {
    const teamId = form.watch("teamId")
    if (teamId && teamId !== "none") {
      const filtered = subteams.filter(subteam => subteam.team_id === teamId)
      setFilteredSubteams(filtered)
      
      // Se não houver subequipes disponíveis, limpa o campo
      if (filtered.length === 0) {
        form.setValue("subteamId", "none")
      }
      // Se a subequipe atual não pertence à equipe selecionada, limpa o campo
      else if (form.watch("subteamId") && form.watch("subteamId") !== "none") {
        const currentSubteam = filtered.find(st => st.id === form.watch("subteamId"))
        if (!currentSubteam) {
          form.setValue("subteamId", "none")
        }
      }
    } else {
      setFilteredSubteams([])
      form.setValue("subteamId", "none")
    }
  }, [form.watch("teamId"), subteams, form])

  // Carrega os dados do funcionário quando o diálogo é aberto
  useEffect(() => {
    console.log("=== DEBUG EmployeeEditDialog ===");
    console.log("Estado do diálogo:", open);
    console.log("Dados recebidos:", {
      employee: employee ? `ID: ${employee.id}` : "undefined/null",
      companyId: companyId || "undefined/null"
    });
    
    if (open) {
      // Verificação se os dados do funcionário estão completos
      if (!employee || !employee.id) {
        console.error("Erro: Dados do funcionário incompletos ou inválidos", {
          employee: employee ? "objeto existe" : "objeto não existe",
          employeeId: employee?.id || "undefined/null"
        });
        
        toast({
          variant: "destructive",
          title: "Erro ao abrir formulário",
          description: "Dados do funcionário inválidos ou incompletos. Feche e tente novamente."
        });
        
        // Fecha o diálogo para evitar erros adicionais
        setTimeout(() => onOpenChange(false), 1500);
        return;
      }
      
      // Se chegou aqui, temos um funcionário válido
      console.log("Diálogo está aberto, tentando carregar dados...");
      
      try {
        // Carrega os dados básicos do formulário
        console.log("Carregando dados do funcionário para o formulário");
        form.reset({
          fullName: employee.full_name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          status: employee.status || "",
          teamId: "none",
          subteamId: "none",
          roleId: "",
        });
        
        // Carrega dados relacionados
        if (companyId) {
          console.log("Tentando carregar dados relacionados com companyId:", companyId);
          loadTeams();
          loadSubteams();
          loadRoles();
          
          if (employee.id) {
            console.log("Tentando carregar relacionamentos para funcionário ID:", employee.id);
            const empId = String(employee.id);
            loadEmployeeRelations(empId);
          }
        } else {
          console.error("CompanyId não está disponível para carregar dados relacionados");
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "ID da empresa não encontrado. Feche e tente novamente."
          });
        }
      } catch (error: any) {
        console.error("Erro ao processar abertura do diálogo:", error.message || error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro inesperado. Feche e tente novamente."
        });
      }
    }
  }, [open, employee, companyId, form, loadTeams, loadSubteams, loadRoles, loadEmployeeRelations, toast, onOpenChange]);

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Prepara os dados para atualização
      const updateData = {
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        status: values.status,
        updated_at: new Date().toISOString(),
      }

      // Atualiza o funcionário no banco de dados
      const { error } = await supabase.from("employees").update(updateData).eq("id", employee.id)

      if (error) {
        throw error
      }

      // Atualiza os relacionamentos do funcionário
      const promises = []

      // Atualiza o cargo
      if (employeeRole) {
        // Se já existe um cargo, atualiza
        if (employeeRole.role_id !== values.roleId) {
          promises.push(
            supabase.from("employee_roles")
              .update({ role_id: values.roleId })
              .eq("id", employeeRole.id)
          )
        }
      } else {
        // Se não existe um cargo, cria
        promises.push(
          supabase.from("employee_roles")
            .insert({
              employee_id: employee.id,
              role_id: values.roleId,
              company_id: companyId,
              start_date: new Date().toISOString().split('T')[0] // Usando data atual como start_date
            })
        )
      }

      // Atualiza a equipe
      if (values.teamId && values.teamId !== "none") {
        if (employeeTeam) {
          // Se já existe uma equipe, atualiza se for diferente
          if (employeeTeam.team_id !== values.teamId) {
            promises.push(
              supabase.from("team_members")
                .update({ team_id: values.teamId })
                .eq("id", employeeTeam.id)
            )
          }
        } else {
          // Se não existe uma equipe, cria
          promises.push(
            supabase.from("team_members")
              .insert({
                employee_id: employee.id,
                team_id: values.teamId
              })
          )
        }
      } else if (employeeTeam) {
        // Se tinha equipe mas não vai ter mais, remove
        promises.push(
          supabase.from("team_members")
            .delete()
            .eq("id", employeeTeam.id)
        )
      }

      // Atualiza a subequipe
      if (values.subteamId && values.subteamId !== "none") {
        if (employeeSubteam) {
          // Se já existe uma subequipe, atualiza se for diferente
          if (employeeSubteam.subteam_id !== values.subteamId) {
            promises.push(
              supabase.from("subteam_members")
                .update({ subteam_id: values.subteamId })
                .eq("id", employeeSubteam.id)
            )
          }
        } else {
          // Se não existe uma subequipe, cria
          promises.push(
            supabase.from("subteam_members")
              .insert({
                employee_id: employee.id,
                subteam_id: values.subteamId
              })
          )
        }
      } else if (employeeSubteam) {
        // Se tinha subequipe mas não vai ter mais, remove
        promises.push(
          supabase.from("subteam_members")
            .delete()
            .eq("id", employeeSubteam.id)
        )
      }

      // Executa todas as atualizações em paralelo
      const results = await Promise.allSettled(promises)
      
      // Verifica se alguma atualização falhou
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        console.error("Alguns relacionamentos não puderam ser atualizados:", failed)
        // Continua mesmo com erros nos relacionamentos, mas loga o erro
      }

      // Exibe mensagem de sucesso
      toast({
        title: "funcionário atualizado",
        description: "os dados do funcionário foram atualizados com sucesso.",
      })

      // Fecha o diálogo e atualiza a página
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      // Exibe mensagem de erro com mais detalhes
      toast({
        variant: "destructive",
        title: "erro ao atualizar funcionário",
        description: error.message || "ocorreu um erro ao atualizar o funcionário."
      })
      console.error("Erro detalhado:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>editar funcionário</DialogTitle>
          <DialogDescription>atualize as informações do funcionário nos campos abaixo.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">dados básicos</TabsTrigger>
                <TabsTrigger value="professional">dados profissionais</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>e-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="joao.silva@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>telefone</FormLabel>
                        <FormControl>
                          <FormattedInput 
                            formatter="cellphone" 
                            placeholder="(11) 99999-9999" 
                            {...field} 
                            onValueChange={(raw) => {
                              form.setValue("phone", raw, { shouldValidate: true });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EmployeeStatus.ACTIVE}>ativo</SelectItem>
                          <SelectItem value={EmployeeStatus.VACATION}>em férias</SelectItem>
                          <SelectItem value={EmployeeStatus.TERMINATED}>desligado</SelectItem>
                          <SelectItem value={EmployeeStatus.MATERNITY_LEAVE}>licença maternidade</SelectItem>
                          <SelectItem value={EmployeeStatus.SICK_LEAVE}>licença saúde</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>cargo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""} 
                        disabled={loadingRoles || loadingRelations}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingRoles || loadingRelations ? (
                            <SelectItem value="loading" disabled>
                              Carregando cargos...
                            </SelectItem>
                          ) : roles.length === 0 ? (
                            <SelectItem value="no-roles" disabled>
                              Nenhum cargo disponível
                            </SelectItem>
                          ) : (
                            roles.map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>equipe</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""} 
                          disabled={loadingTeams || loadingRelations}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma equipe (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma equipe</SelectItem>
                            {loadingTeams || loadingRelations ? (
                              <SelectItem value="loading" disabled>
                                Carregando equipes...
                              </SelectItem>
                            ) : teams.length === 0 ? (
                              <SelectItem value="no-teams" disabled>
                                Nenhuma equipe disponível
                              </SelectItem>
                            ) : (
                              teams.map(team => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subteamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>subequipe</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""} 
                          disabled={!form.watch("teamId") || filteredSubteams.length === 0 || loadingSubteams || loadingRelations}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma subequipe (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma subequipe</SelectItem>
                            {loadingSubteams || loadingRelations ? (
                              <SelectItem value="loading" disabled>
                                Carregando subequipes...
                              </SelectItem>
                            ) : !form.watch("teamId") || form.watch("teamId") === "none" ? (
                              <SelectItem value="no-team" disabled>
                                Selecione uma equipe primeiro
                              </SelectItem>
                            ) : filteredSubteams.length === 0 ? (
                              <SelectItem value="no-subteams" disabled>
                                Nenhuma subequipe disponível para esta equipe
                              </SelectItem>
                            ) : (
                              filteredSubteams.map(subteam => (
                                <SelectItem key={subteam.id} value={subteam.id}>
                                  {subteam.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "salvando..." : "salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

