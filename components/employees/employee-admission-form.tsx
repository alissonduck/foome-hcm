"use client"

/**
 * Formulário de admissão de funcionário
 */
import { useState } from "react"
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
import { ContractType, MaritalStatus, EducationLevel } from "@/lib/types"
import { numbersOnly } from "@/lib/utils/formatters"

/**
 * Props para o componente EmployeeAdmissionForm
 */
interface EmployeeAdmissionFormProps {
  companyId: string
  userId: string
}

/**
 * Schema de validação para o formulário de admissão
 */
const formSchema = z
  .object({
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
    cpf: z.string().min(11, {
      message: "Digite um CPF válido.",
    }),
    rg: z.string().min(8, {
      message: "Digite um RG válido.",
    }),
    maritalStatus: z.string(),
    educationLevel: z.string(),
    dependents: z.string().optional(),

    // Dados profissionais
    position: z.string().min(2, {
      message: "Digite um cargo válido.",
    }),
    department: z.string().min(2, {
      message: "Digite um departamento válido.",
    }),
    contractType: z.string(),
    hireDate: z.string(),

    // Dados específicos CLT
    pis: z.string().optional(),
    ctps: z.string().optional(),

    // Dados específicos PJ
    cnpj: z.string().optional(),
    companyName: z.string().optional(),
    serviceDescription: z.string().optional(),

    // Endereço
    street: z.string().min(3, {
      message: "Digite um endereço válido.",
    }),
    number: z.string().min(1, {
      message: "Digite um número válido.",
    }),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, {
      message: "Digite um bairro válido.",
    }),
    city: z.string().min(2, {
      message: "Digite uma cidade válida.",
    }),
    state: z.string().min(2, {
      message: "Digite um estado válido.",
    }),
    zipCode: z.string().min(8, {
      message: "Digite um CEP válido.",
    }),

    // Dados bancários
    bankName: z.string().min(2, {
      message: "Digite um banco válido.",
    }),
    accountType: z.string(),
    agency: z.string().min(2, {
      message: "Digite uma agência válida.",
    }),
    account: z.string().min(5, {
      message: "Digite uma conta válida.",
    }),
    pixKey: z.string().optional(),

    // Contato de emergência
    emergencyName: z.string().min(3, {
      message: "Digite um nome válido.",
    }),
    emergencyRelationship: z.string().min(2, {
      message: "Digite um relacionamento válido.",
    }),
    emergencyPhone: z.string().min(10, {
      message: "Digite um telefone válido.",
    }),

    // Novo campo de remuneração
    salary: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.contractType === ContractType.CLT) {
        return !!data.pis && !!data.ctps
      }
      return true
    },
    {
      message: "PIS e CTPS são obrigatórios para contratação CLT",
      path: ["pis"],
    },
  )
  .refine(
    (data) => {
      if (data.contractType === ContractType.PJ) {
        return !!data.cnpj && !!data.companyName && !!data.serviceDescription
      }
      return true
    },
    {
      message: "CNPJ, Nome da Empresa e Descrição do Serviço são obrigatórios para contratação PJ",
      path: ["cnpj"],
    },
  )

/**
 * Componente de formulário de admissão de funcionário
 * @param companyId ID da empresa
 * @param userId ID do usuário
 * @returns Formulário de admissão de funcionário
 */
export default function EmployeeAdmissionForm({ companyId, userId }: EmployeeAdmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
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
      cpf: "",
      rg: "",
      maritalStatus: MaritalStatus.SINGLE,
      educationLevel: EducationLevel.HIGH_SCHOOL,
      dependents: "",
      position: "",
      department: "",
      contractType: ContractType.CLT,
      hireDate: new Date().toISOString().split("T")[0],
      pis: "",
      ctps: "",
      cnpj: "",
      companyName: "",
      serviceDescription: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
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
        dependents: values.dependents,

        // Dados específicos por tipo de contrato
        pis: values.contractType === ContractType.CLT ? values.pis : null,
        ctps: values.contractType === ContractType.CLT ? values.ctps : null,
        cnpj: values.contractType === ContractType.PJ ? values.cnpj : null,
        company_name: values.contractType === ContractType.PJ ? values.companyName : null,
        service_description: values.contractType === ContractType.PJ ? values.serviceDescription : null,

        // Dados estruturados
        address: {
          street: values.street,
          number: values.number,
          complement: values.complement,
          neighborhood: values.neighborhood,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
        },
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
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="professional">Dados Profissionais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="financial">Dados Financeiros</TabsTrigger>
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
                            <SelectItem value={EducationLevel.MASTER}>Mestrado</SelectItem>
                            <SelectItem value={EducationLevel.DOCTORATE}>Doutorado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dependents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dependentes</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de dependentes" {...field} />
                        </FormControl>
                        <FormDescription>Informe o número de dependentes para IR</FormDescription>
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" {...field} />
                        </FormControl>
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
  )
}

