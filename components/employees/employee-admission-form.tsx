"use client"

/**
 * Formulário de admissão de funcionário
 */
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormattedInput } from "@/components/ui/formatted-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ContractType, MaritalStatus, EducationLevel } from "@/lib/types/index"
import { numbersOnly } from "@/lib/utils/formatters"
import { 
  EmployeeDependentInsert, 
  DependentGender, 
  DependentRelationship,
  EmployeeDependent
} from "@/lib/types/documents"
import { DependentManagement } from "@/components/dependents/dependent-management"
import { DependentFormValues } from "@/lib/schemas/dependent-schema"
import { DependentDialog } from "@/components/dependents/dependent-dialog"
import { DependentForm } from "@/components/dependents/dependent-form"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { useAddress } from "@/hooks/use-address"

/**
 * Props para o componente EmployeeAdmissionForm
 */
interface EmployeeAdmissionFormProps {
  companyId: string
  userId: string
}

/**
 * Esquema de validação para o formulário
 */
const formSchema = z.object({
  // Dados pessoais
  fullName: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().email({
    message: "E-mail inválido.",
  }),
  phone: z.string().min(8, {
    message: "Telefone inválido.",
  }),
  cpf: z.string().min(11, {
    message: "CPF inválido.",
  }),
  rg: z.string().min(8, {
    message: "RG inválido.",
  }),
  maritalStatus: z.nativeEnum(MaritalStatus),
  educationLevel: z.nativeEnum(EducationLevel),

  // Dados profissionais
  position: z.string().min(2, {
    message: "Cargo inválido.",
  }),
  department: z.string().min(2, {
    message: "Departamento inválido.",
  }),
  contractType: z.nativeEnum(ContractType),
  hireDate: z.string({
    required_error: "Data de admissão é obrigatória.",
  }),

  // Campos condicionais - preenchidos apenas para CLT
  pis: z.string().optional(),
  ctps: z.string().optional(),

  // Campos condicionais - preenchidos apenas para PJ
  cnpj: z.string().optional(),
  companyName: z.string().optional(),
  serviceDescription: z.string().optional(),

  // Endereço
  street: z.string({
    required_error: "Rua é obrigatória.",
  }),
  number: z.string({
    required_error: "Número é obrigatório.",
  }),
  complement: z.string().optional(),
  neighborhood: z.string({
    required_error: "Bairro é obrigatório.",
  }),
  countryId: z.string({
    required_error: "País é obrigatório.",
  }),
  stateId: z.string({
    required_error: "Estado é obrigatório.",
  }),
  cityId: z.string({
    required_error: "Cidade é obrigatória.",
  }),
  zipCode: z.string({
    required_error: "CEP é obrigatório.",
  }),

  // Dados bancários
  bankName: z.string({
    required_error: "Nome do banco é obrigatório.",
  }),
  accountType: z.string({
    required_error: "Tipo de conta é obrigatório.",
  }),
  agency: z.string({
    required_error: "Agência é obrigatória.",
  }),
  account: z.string({
    required_error: "Conta é obrigatória.",
  }),
  pixKey: z.string().optional(),

  // Dados de emergência
  emergencyName: z.string({
    required_error: "Nome do contato de emergência é obrigatório.",
  }),
  emergencyRelationship: z.string({
    required_error: "Relação do contato de emergência é obrigatória.",
  }),
  emergencyPhone: z.string({
    required_error: "Telefone do contato de emergência é obrigatório.",
  }),

  // Campo de salário
  salary: z.string().optional(),
})

/**
 * Componente de formulário de admissão de funcionário
 * @param companyId ID da empresa
 * @param userId ID do usuário
 * @returns Formulário de admissão de funcionário
 */
export default function EmployeeAdmissionForm({ companyId, userId }: EmployeeAdmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [dependents, setDependents] = useState<EmployeeDependentInsert[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentDependent, setCurrentDependent] = useState<EmployeeDependent | undefined>(undefined)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const { 
    countries, 
    states, 
    cities, 
    selectedCountryId, 
    selectedStateId,
    setSelectedCountryId, 
    setSelectedStateId,
    isLoadingCountries,
    isLoadingStates,
    isLoadingCities
  } = useAddress()

  // Monitor para o estado do diálogo
  useEffect(() => {
    console.log("Estado do diálogo alterado:", dialogOpen);
  }, [dialogOpen]);

  // Função para adicionar um dependente temporário
  const handleAddDependent = (values: DependentFormValues & { employee_id?: string }) => {
    // Converte para o formato correto
    const newDependent: EmployeeDependentInsert = {
      ...values,
      employee_id: "", // Será definido depois que o funcionário for criado
    };
    
    if (editingIndex !== null) {
      // Editar dependente existente
      const updatedDependents = [...dependents];
      updatedDependents[editingIndex] = newDependent;
      setDependents(updatedDependents);
      
      toast({
        title: "Dependente atualizado",
        description: "O dependente foi atualizado com sucesso."
      });
      
      setEditingIndex(null);
    } else {
      // Adicionar novo dependente
      setDependents([...dependents, newDependent]);
      
      toast({
        title: "Dependente adicionado",
        description: "O dependente foi adicionado com sucesso."
      });
    }
    
    setDialogOpen(false);
  }
  
  // Função para iniciar a edição de um dependente
  const handleEditDependentStart = (index: number) => {
    setEditingIndex(index);
    setCurrentDependent(dependents[index] as unknown as EmployeeDependent);
    setDialogOpen(true);
  }
  
  // Função para remover um dependente temporário
  const handleRemoveDependent = (index: number) => {
    const updatedDependents = [...dependents];
    updatedDependents.splice(index, 1);
    
    setDependents(updatedDependents);
    toast({
      title: "Dependente removido",
      description: "O dependente foi removido da lista."
    });
  }
  
  // Função para abrir o diálogo para adicionar novo dependente
  const handleOpenAddDependentDialog = () => {
    console.log("Abrindo diálogo para adicionar dependente");
    setCurrentDependent(undefined);
    setEditingIndex(null);
    setDialogOpen(true);
    console.log("Estado do diálogo após atualização:", true);
  }

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      maritalStatus: MaritalStatus.SINGLE,
      educationLevel: EducationLevel.HIGH_SCHOOL,
      position: "",
      department: "",
      contractType: ContractType.CLT,
      hireDate: "",
      pis: "",
      ctps: "",
      cnpj: "",
      companyName: "",
      serviceDescription: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      countryId: "",
      stateId: "",
      cityId: "",
      zipCode: "",
      bankName: "",
      accountType: "checking",
      agency: "",
      account: "",
      pixKey: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      salary: "",
    },
  })

  /**
   * Função para lidar com o envio do formulário
   * @param values Valores do formulário
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      // Captura os dependentes da state
      const dependentsToSave = dependents.map(dependent => ({
        ...dependent,
        // Certifica-se que o employee_id será definido após o funcionário ser criado
        employee_id: "",
      }));

      // Prepara os dados para inserção
      const employeeData = {
        company_id: companyId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        position: values.position,
        department: values.department,
        status: "active",
        contract_type: values.contractType,
        hire_date: values.hireDate,
        cpf: values.cpf,
        rg: values.rg,
        marital_status: values.maritalStatus,
        education_level: values.educationLevel,

        // Dados específicos por tipo de contrato
        pis: values.contractType === ContractType.CLT ? values.pis : null,
        ctps: values.contractType === ContractType.CLT ? values.ctps : null,
        cnpj: values.contractType === ContractType.PJ ? values.cnpj : null,
        company_name: values.contractType === ContractType.PJ ? values.companyName : null,
        service_description: values.contractType === ContractType.PJ ? values.serviceDescription : null,

        // Dados estruturados
        bank_info: {
          bankName: values.bankName,
          accountType: values.accountType,
          agency: values.agency,
          account: values.account,
          pixKey: values.pixKey,
        },
        emergency_contact: {
          name: values.emergencyName,
          relationship: values.emergencyRelationship,
          phone: values.emergencyPhone,
        },

        // Novo campo de remuneração
        salary: values.salary,

        created_by: userId,
      }

      // Insere o funcionário no banco de dados
      const { data, error } = await supabase.from("employees").insert(employeeData).select("id").single()

      if (error) {
        throw new Error(error.message)
      }

      // Insere o endereço do funcionário na nova tabela
      const addressData = {
        employee_id: data.id,
        street: values.street,
        number: values.number,
        complement: values.complement || null,
        neighborhood: values.neighborhood,
        postal_code: values.zipCode,
        country_id: values.countryId,
        state_id: values.stateId,
        city_id: values.cityId
      }

      const { error: addressError } = await supabase.from("employee_addresses").insert(addressData)

      if (addressError) {
        console.error("Erro ao salvar endereço:", addressError)
        // Continua mesmo com erro no endereço, mas loga o erro
      }

      // Se tiver dependentes, salva-os
      if (dependentsToSave.length > 0) {
        // Atualiza o employee_id de cada dependente
        const dependentsWithEmployeeId = dependentsToSave.map(dependent => ({
          ...dependent,
          employee_id: data.id,
        }));

        // Insere os dependentes
        const { error: dependentsError } = await supabase
          .from("employee_dependents")
          .insert(dependentsWithEmployeeId);

        if (dependentsError) {
          console.error("Erro ao salvar dependentes:", dependentsError);
          // Continua mesmo com erro nos dependentes, mas loga o erro
        }
      }

      // Exibe mensagem de sucesso
      toast({
        title: "Funcionário admitido com sucesso",
        description: `${values.fullName} foi adicionado à sua empresa.`,
      })

      // Redireciona para a lista de funcionários
      router.push("/dashboard/employees")
      router.refresh()
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao admitir funcionário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao admitir o funcionário.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Função para avançar para a próxima aba
   */
  const nextTab = () => {
    if (activeTab === "personal") {
      setActiveTab("professional")
    } else if (activeTab === "professional") {
      setActiveTab("address")
    } else if (activeTab === "address") {
      setActiveTab("financial")
    } else if (activeTab === "financial") {
      setActiveTab("dependents")
    }
  }

  /**
   * Função para voltar para a aba anterior
   */
  const prevTab = () => {
    if (activeTab === "professional") {
      setActiveTab("personal")
    } else if (activeTab === "address") {
      setActiveTab("professional")
    } else if (activeTab === "financial") {
      setActiveTab("address")
    } else if (activeTab === "dependents") {
      setActiveTab("financial")
    }
  }

  // Atualiza os estados quando o país é alterado
  useEffect(() => {
    const countryId = form.watch("countryId");
    if (countryId) {
      setSelectedCountryId(countryId);
      // Limpa o estado e a cidade quando o país é alterado
      form.setValue("stateId", "");
      form.setValue("cityId", "");
    }
  }, [form.watch("countryId")]);

  // Atualiza as cidades quando o estado é alterado
  useEffect(() => {
    const stateId = form.watch("stateId");
    if (stateId) {
      setSelectedStateId(stateId);
      // Limpa a cidade quando o estado é alterado
      form.setValue("cityId", "");
    }
  }, [form.watch("stateId")]);

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="professional">Dados Profissionais</TabsTrigger>
                  <TabsTrigger value="address">Endereço</TabsTrigger>
                  <TabsTrigger value="financial">Dados Financeiros</TabsTrigger>
                  <TabsTrigger value="dependents">Dependentes</TabsTrigger>
                </TabsList>

                {/* Aba de Dados Pessoais */}
                <TabsContent value="personal" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="joao.silva@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="cellphone" 
                              placeholder="(11) 98765-4321" 
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
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="cpf" 
                              placeholder="123.456.789-00" 
                              {...field} 
                              onValueChange={(raw) => {
                                form.setValue("cpf", raw, { shouldValidate: true });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="rg" 
                              placeholder="09.295.014-0" 
                              {...field} 
                              onValueChange={(raw) => {
                                form.setValue("rg", raw, { shouldValidate: true });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={MaritalStatus.SINGLE}>Solteiro(a)</SelectItem>
                              <SelectItem value={MaritalStatus.MARRIED}>Casado(a)</SelectItem>
                              <SelectItem value={MaritalStatus.DIVORCED}>Divorciado(a)</SelectItem>
                              <SelectItem value={MaritalStatus.WIDOWED}>Viúvo(a)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolaridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a escolaridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={EducationLevel.ELEMENTARY}>Ensino Fundamental</SelectItem>
                              <SelectItem value={EducationLevel.HIGH_SCHOOL}>Ensino Médio</SelectItem>
                              <SelectItem value={EducationLevel.TECHNICAL}>Ensino Técnico</SelectItem>
                              <SelectItem value={EducationLevel.BACHELOR}>Graduação</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba de Dados Profissionais */}
                <TabsContent value="professional" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input placeholder="Analista de RH" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <FormControl>
                            <Input placeholder="Recursos Humanos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contractType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Contrato</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de contrato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ContractType.CLT}>CLT</SelectItem>
                              <SelectItem value={ContractType.PJ}>PJ</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hireDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Admissão</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("contractType") === ContractType.CLT && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="pis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIS</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123.45678.90-1" 
                                {...field} 
                                onChange={(e) => {
                                  // Mantém apenas números
                                  const value = numbersOnly(e.target.value);
                                  // Atualiza o campo com apenas números
                                  form.setValue("pis", value, { shouldValidate: true });
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ctps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CTPS</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="12345/001" 
                                {...field} 
                                onChange={(e) => {
                                  // Mantém apenas números e /
                                  const value = e.target.value.replace(/[^\d\/]/g, '');
                                  // Atualiza o campo
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch("contractType") === ContractType.PJ && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl>
                                <FormattedInput 
                                  formatter="cnpj" 
                                  placeholder="12.345.678/0001-90" 
                                  {...field} 
                                  onValueChange={(raw) => {
                                    form.setValue("cnpj", raw, { shouldValidate: true });
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input placeholder="João Silva Consultoria ME" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="serviceDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição do Serviço</FormLabel>
                            <FormControl>
                              <Input placeholder="Consultoria em Recursos Humanos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                    <Button type="button" onClick={nextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba de Endereço */}
                <TabsContent value="address" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rua</FormLabel>
                            <FormControl>
                              <Input placeholder="Av. Paulista" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bela Vista" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="countryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o país" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCountries ? (
                                <SelectItem value="loading" disabled>
                                  Carregando países...
                                </SelectItem>
                              ) : (
                                countries.map((country) => (
                                  <SelectItem key={country.id} value={country.id}>
                                    {country.name}
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
                      name="stateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCountryId || isLoadingStates}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingStates ? (
                                <SelectItem value="loading" disabled>
                                  Carregando estados...
                                </SelectItem>
                              ) : !selectedCountryId ? (
                                <SelectItem value="no-country" disabled>
                                  Selecione um país primeiro
                                </SelectItem>
                              ) : states.length === 0 ? (
                                <SelectItem value="no-states" disabled>
                                  Nenhum estado encontrado
                                </SelectItem>
                              ) : (
                                states.map((state) => (
                                  <SelectItem key={state.id} value={state.id}>
                                    {state.name}
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedStateId || isLoadingCities}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCities ? (
                                <SelectItem value="loading" disabled>
                                  Carregando cidades...
                                </SelectItem>
                              ) : !selectedStateId ? (
                                <SelectItem value="no-state" disabled>
                                  Selecione um estado primeiro
                                </SelectItem>
                              ) : cities.length === 0 ? (
                                <SelectItem value="no-cities" disabled>
                                  Nenhuma cidade encontrada
                                </SelectItem>
                              ) : (
                                cities.map((city) => (
                                  <SelectItem key={city.id} value={city.id}>
                                    {city.name}
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
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="cep" 
                              placeholder="01310-100" 
                              {...field} 
                              onValueChange={(raw) => {
                                form.setValue("zipCode", raw, { shouldValidate: true });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                    <Button type="button" onClick={nextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba de Dados Financeiros */}
                <TabsContent value="financial" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dados Bancários</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco</FormLabel>
                            <FormControl>
                              <Input placeholder="Banco do Brasil" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Conta</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de conta" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="checking">Conta Corrente</SelectItem>
                                <SelectItem value="savings">Conta Poupança</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pixKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chave PIX</FormLabel>
                            <FormControl>
                              <Input placeholder="CPF, e-mail, telefone ou chave aleatória" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="agency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agência</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1234" 
                                {...field} 
                                onChange={(e) => {
                                  // Mantém apenas números e -
                                  const value = e.target.value.replace(/[^\d-]/g, '');
                                  // Atualiza o campo
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="account"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="12345-6" 
                                {...field} 
                                onChange={(e) => {
                                  // Mantém apenas números e -
                                  const value = e.target.value.replace(/[^\d-]/g, '');
                                  // Atualiza o campo
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Contato de Emergência</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="emergencyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Maria Silva" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="emergencyRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parentesco</FormLabel>
                            <FormControl>
                              <Input placeholder="Cônjuge" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone de Emergência</FormLabel>
                          <FormControl>
                            <FormattedInput 
                              formatter="cellphone" 
                              placeholder="(11) 99999-9999" 
                              {...field} 
                              onValueChange={(raw) => {
                                form.setValue("emergencyPhone", raw, { shouldValidate: true });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                    <Button type="button" onClick={nextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>

                {/* Nova aba de Dependentes */}
                <TabsContent value="dependents" className="space-y-4 pt-4">
                  <div className="flex flex-col space-y-4">
                    <div className="border rounded-md p-4">
                      
                      {/* Componente personalizado para gerenciar dependentes */}
                      <div className="flex flex-col space-y-4">
                        {dependents.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            Nenhum dependente adicionado para este funcionário. Adicione dependentes (filhos) do funcionário. Estes dados são importantes para benefícios, imposto de renda e registros legais.
                          </div>
                        ) : (
                          <div className="border rounded-md">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Nasc.</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {dependents.map((dependent, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {dependent.full_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {format(new Date(dependent.birth_date), "dd/MM/yyyy", { locale: pt })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {dependent.relationship === DependentRelationship.CHILD ? 'Filho(a)' : 
                                       dependent.relationship === DependentRelationship.STEPCHILD ? 'Enteado(a)' :
                                       dependent.relationship === DependentRelationship.FOSTER_CHILD ? 'Filho(a) adotivo(a)' :
                                       dependent.relationship === DependentRelationship.LEGAL_WARD ? 'Tutelado(a)' : 'Outro'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex items-center space-x-1">
                                        {dependent.is_student && (
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Estudante
                                          </span>
                                        )}
                                        {dependent.has_disability && (
                                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            PCD
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleEditDependentStart(index)}
                                        >
                                          Editar
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleRemoveDependent(index)}
                                        >
                                          Remover
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-auto self-end"
                          onClick={() => {
                            console.log("Botão clicado");
                            setCurrentDependent(undefined);
                            setEditingIndex(null);
                            setDialogOpen(true);
                          }}
                        >
                          Adicionar Dependente
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Cadastrando..." : "Cadastrar Funcionário"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Diálogo para adicionar/editar dependentes */}
      <DependentDialog
        employeeId=""
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddDependent}
        currentDependent={currentDependent}
        isSubmitting={isLoading}
      />
    </>
  )
}

