"use client"

/**
 * Formulário de registro da empresa em etapas
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Building, CheckCircle, User, Briefcase, Building2, Hash, Loader2, Mail, Phone } from "lucide-react"
import { adminFormSchema, companyFormSchema } from "@/lib/schemas/register-schema"
import type { AdminFormValues, CompanyFormValues } from "@/lib/schemas/register-schema"
import { registerCompany } from "@/server/actions/register-actions"

/**
 * Props para o componente CompanyRegisterForm
 */
interface CompanyRegisterFormProps {
  userId: string
}

/**
 * Componente de formulário de registro da empresa em etapas
 * @param userId ID do usuário autenticado
 * @returns Formulário de registro da empresa em etapas
 */
export default function CompanyRegisterForm({ userId }: CompanyRegisterFormProps) {
  const [step, setStep] = useState<"admin" | "company" | "success">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [adminData, setAdminData] = useState<AdminFormValues | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Configuração do formulário de administrador
  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      position: "Gerente de RH",
      department: "Recursos Humanos",
    },
  })

  // Configuração do formulário de empresa
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      sizeRange: "",
    },
  })

  /**
   * Função para lidar com o envio do formulário de administrador
   * @param values Valores do formulário
   */
  async function onSubmitAdmin(values: AdminFormValues) {
    setAdminData(values)
    setStep("company")
  }

  /**
   * Função para lidar com o envio do formulário de empresa
   * @param values Valores do formulário
   */
  async function onSubmitCompany(values: CompanyFormValues) {
    try {
      setIsLoading(true)

      if (!adminData) {
        throw new Error("Dados do administrador não encontrados.")
      }

      // Chama a server action para registrar a empresa e o administrador
      const result = await registerCompany(
        { ...values, created_by: userId },
        adminData,
        userId
      )

      if (!result.success) {
        throw new Error(result.error || "Falha ao cadastrar empresa")
      }

      // Avança para a etapa de sucesso
      setStep("success")
    } catch (error) {
      // Exibe mensagem de erro
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar empresa",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar sua empresa.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Função para ir para o dashboard após o cadastro
   */
  function goToDashboard() {
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-gray-900/95 overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-2xl font-bold">Cadastro da Empresa</CardTitle>
          <CardDescription>Complete o cadastro da sua empresa em duas etapas simples</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={step} className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-0 h-auto bg-muted/30 rounded-none">
              <TabsTrigger
                value="admin"
                disabled={step !== "admin"}
                className="flex items-center gap-2 py-4 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent"
              >
                <Users className="h-4 w-4" />
                <span>Administrador</span>
              </TabsTrigger>
              <TabsTrigger
                value="company"
                disabled={step !== "company"}
                className="flex items-center gap-2 py-4 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent"
              >
                <Building className="h-4 w-4" />
                <span>Empresa</span>
              </TabsTrigger>
              <TabsTrigger
                value="success"
                disabled={step !== "success"}
                className="flex items-center gap-2 py-4 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 border-b-2 data-[state=active]:border-primary data-[state=inactive]:border-transparent"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Concluído</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="m-0 p-6 sm:p-8">
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onSubmitAdmin)} className="space-y-5">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-medium">Dados do Administrador</h3>
                    <p className="text-sm text-muted-foreground">
                      Informe os dados do administrador principal do sistema
                    </p>
                  </div>

                  <FormField
                    control={adminForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nome completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="João Silva" className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="seu@email.com" className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="(11) 98765-4321" className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Cargo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Gerente de RH" className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Departamento</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Recursos Humanos" className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-11 mt-6 rounded-lg font-medium transition-all">
                    Próximo
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="company" className="m-0 p-6 sm:p-8">
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-5">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-medium">Dados da Empresa</h3>
                    <p className="text-sm text-muted-foreground">
                      Informe os dados básicos da sua empresa
                    </p>
                  </div>

                  <FormField
                    control={companyForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nome da empresa</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Empresa S.A." className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">CNPJ</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="00.000.000/0001-00" className="pl-10 h-11 rounded-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="sizeRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Porte da empresa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-lg">
                              <SelectValue placeholder="Selecione o porte da empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="micro">Microempresa (até 19 funcionários)</SelectItem>
                            <SelectItem value="small">Pequena (20 a 99 funcionários)</SelectItem>
                            <SelectItem value="medium">Média (100 a 499 funcionários)</SelectItem>
                            <SelectItem value="large">Grande (500 ou mais funcionários)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 rounded-lg font-medium"
                      onClick={() => setStep("admin")}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 rounded-lg font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        "Finalizar"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="success" className="m-0 p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-primary/10 rounded-full p-3 mb-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Cadastro Concluído!</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                  Sua empresa foi cadastrada com sucesso. Agora você pode começar a usar o sistema para gerenciar seus funcionários.
                </p>
                <Button onClick={goToDashboard} className="h-11 px-8 rounded-lg font-medium">
                  Ir para o Dashboard
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 