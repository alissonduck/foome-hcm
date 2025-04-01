"use client"

/**
 * Diálogo para edição de funcionário
 */
import { useState, useEffect } from "react"
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
  is_primary: boolean
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
      teamId: "",
      subteamId: "",
      roleId: "",
    },
  })

  // Carrega os dados do funcionário quando o diálogo é aberto
  useEffect(() => {
    if (open && employee) {
      form.reset({
        fullName: employee.full_name,
        email: employee.email,
        phone: employee.phone || "",
        status: employee.status,
        teamId: "",
        subteamId: "",
        roleId: "",
      })

      // Carrega as equipes, subequipes, cargos e relacionamentos do funcionário
      loadTeams()
      loadSubteams()
      loadRoles()
      loadEmployeeRelations(employee.id)
    }
  }, [open, employee, form])

  // Filtra as subequipes quando a equipe é selecionada
  useEffect(() => {
    const teamId = form.watch("teamId")
    if (teamId) {
      const filtered = subteams.filter(subteam => subteam.team_id === teamId)
      setFilteredSubteams(filtered)
      
      // Se não houver subequipes disponíveis, limpa o campo
      if (filtered.length === 0) {
        form.setValue("subteamId", "")
      }
      // Se a subequipe atual não pertence à equipe selecionada, limpa o campo
      else if (form.watch("subteamId")) {
        const currentSubteam = filtered.find(st => st.id === form.watch("subteamId"))
        if (!currentSubteam) {
          form.setValue("subteamId", "")
        }
      }
    } else {
      setFilteredSubteams([])
      form.setValue("subteamId", "")
    }
  }, [form.watch("teamId"), subteams, form])

  // Função para carregar as equipes
  const loadTeams = async () => {
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
  }

  // Função para carregar as subequipes
  const loadSubteams = async () => {
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
  }

  // Função para carregar os cargos
  const loadRoles = async () => {
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
  }

  // Função para carregar os relacionamentos do funcionário
  const loadEmployeeRelations = async (employeeId: string) => {
    setLoadingRelations(true)
    try {
      // Carrega o time do funcionário
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle()
      
      if (teamError) throw teamError
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
        .eq('is_primary', true)
        .maybeSingle()
      
      if (roleError) throw roleError
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
  }

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
              is_primary: true
            })
        )
      }

      // Atualiza a equipe
      if (values.teamId) {
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
      if (values.subteamId) {
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
                            <SelectItem value="">Nenhuma equipe</SelectItem>
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
                            <SelectItem value="">Nenhuma subequipe</SelectItem>
                            {loadingSubteams || loadingRelations ? (
                              <SelectItem value="loading" disabled>
                                Carregando subequipes...
                              </SelectItem>
                            ) : !form.watch("teamId") ? (
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

