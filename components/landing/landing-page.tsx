/**
 * Página de landing da aplicação
 */
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  MoveRight,
  Users,
  Building,
  ClipboardCheck,
  BarChart3,
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Star,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
 * Componente da página de landing
 * @returns Página de landing com informações sobre o produto
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm dark:bg-gray-950/90 dark:border-gray-800 shadow-sm">
        <div className="foome-container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#funcionalidades" className="text-sm font-medium hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#solucao" className="text-sm font-medium hover:text-primary transition-colors">
              Solução
            </a>
            <a href="#depoimentos" className="text-sm font-medium hover:text-primary transition-colors">
              Depoimentos
            </a>
            <a href="#contato" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent">
        <div className="foome-container">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                <span>Novo</span>
                <span className="mx-1">•</span>
                <span>Plataforma completa para RH</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Simplifique a gestão de <span className="text-primary">funcionários</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Uma plataforma completa para gerenciar todo o ciclo de vida dos seus colaboradores, desde a admissão
                  até o desligamento.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8">
                    Começar agora
                    <MoveRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8">
                    Ver demonstração
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3 text-primary" />
                  <span>Fácil de usar</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3 text-primary" />
                  <span>Sem instalação</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3 text-primary" />
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Dashboard Foome"
                    width={600}
                    height={400}
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">Dashboard intuitivo</h3>
                      <p className="text-xs text-muted-foreground">
                        Visualize todos os dados importantes em um só lugar
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span className="text-xs">Ver mais</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="foome-container">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-muted-foreground">EMPRESAS QUE CONFIAM NA FOOME</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-12 w-full flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={`/placeholder.svg?height=48&width=120&text=Cliente ${i}`}
                  alt={`Cliente ${i}`}
                  width={120}
                  height={48}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="foome-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Métricas de RH no Brasil</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dados que mostram a importância de uma gestão eficiente de recursos humanos para o sucesso das empresas
              brasileiras.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="foome-card border-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">47%</div>
                <p className="text-sm text-muted-foreground">
                  das empresas enfrentam dificuldades com processos manuais de RH
                </p>
              </CardContent>
            </Card>
            <Card className="foome-card border-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">68%</div>
                <p className="text-sm text-muted-foreground">
                  dos profissionais de RH gastam tempo excessivo com tarefas administrativas
                </p>
              </CardContent>
            </Card>
            <Card className="foome-card border-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">32%</div>
                <p className="text-sm text-muted-foreground">
                  de redução em custos operacionais com automação de processos de RH
                </p>
              </CardContent>
            </Card>
            <Card className="foome-card border-none">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">89%</div>
                <p className="text-sm text-muted-foreground">
                  das empresas que investem em tecnologia para RH relatam maior satisfação dos funcionários
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="foome-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/placeholder.svg?height=400&width=500&text=Problemas de RH"
                alt="Problemas de RH"
                width={500}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive/10 text-destructive">
                O PROBLEMA
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Desafios na gestão de funcionários</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Processos manuais e ineficientes</h3>
                    <p className="text-sm text-muted-foreground">
                      Excesso de planilhas e documentos físicos que dificultam o acesso às informações.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Dificuldade no controle de documentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Documentos perdidos, vencidos ou incompletos geram riscos legais e operacionais.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Gestão de férias e ausências complexa</h3>
                    <p className="text-sm text-muted-foreground">
                      Controle manual de férias e licenças gera conflitos e falhas no planejamento.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Onboarding desorganizado</h3>
                    <p className="text-sm text-muted-foreground">
                      Processos de integração inconsistentes que prejudicam a experiência dos novos funcionários.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solucao" className="py-16 md:py-24">
        <div className="foome-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-success/10 text-success">
                A SOLUÇÃO
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Foome: Plataforma completa para gestão de funcionários
              </h2>
              <p className="text-muted-foreground">
                A Foome é uma plataforma SaaS que centraliza e automatiza todos os processos de gestão de funcionários,
                desde a admissão até o desligamento, proporcionando:
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Centralização de informações</h3>
                    <p className="text-sm text-muted-foreground">
                      Todos os dados e documentos dos funcionários em um único lugar, acessível de qualquer dispositivo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Automação de processos</h3>
                    <p className="text-sm text-muted-foreground">
                      Fluxos de trabalho automatizados que reduzem erros e aumentam a produtividade da equipe de RH.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Conformidade legal</h3>
                    <p className="text-sm text-muted-foreground">
                      Garantia de que todos os processos estão em conformidade com a legislação trabalhista brasileira.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Experiência do funcionário</h3>
                    <p className="text-sm text-muted-foreground">
                      Melhoria na experiência dos colaboradores com processos mais ágeis e transparentes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/register">
                  <Button className="gap-2">
                    Conhecer a plataforma
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="/placeholder.svg?height=400&width=500&text=Solução Foome"
                alt="Solução Foome"
                width={500}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="funcionalidades"
        className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
      >
        <div className="foome-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-4">
              FUNCIONALIDADES
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Tudo o que você precisa para gerenciar seus funcionários
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A Foome oferece um conjunto completo de ferramentas para simplificar a gestão de recursos humanos da sua
              empresa.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="foome-card border-none hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 pt-8">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de Funcionários</h3>
                <p className="text-muted-foreground mb-4">
                  Cadastro completo de funcionários CLT e PJ, com histórico de alterações, documentos e informações
                  pessoais e profissionais.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Cadastro de dados pessoais e profissionais</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Histórico de alterações</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Filtros e busca avançada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="foome-card border-none hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 pt-8">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de Documentos</h3>
                <p className="text-muted-foreground mb-4">
                  Armazenamento seguro de documentos com controle de vencimento, aprovação e histórico de versões.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Upload e armazenamento seguro</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Controle de vencimento</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Fluxo de aprovação</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="foome-card border-none hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 pt-8">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Férias e Ausências</h3>
                <p className="text-muted-foreground mb-4">
                  Gestão completa de férias, licenças e outras ausências, com fluxo de aprovação e controle de saldos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Solicitação e aprovação de férias</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Controle de licenças</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Calendário de ausências</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="foome-card border-none hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 pt-8">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Onboarding</h3>
                <p className="text-muted-foreground mb-4">
                  Processo estruturado de integração de novos funcionários, com checklist de tarefas e acompanhamento.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Checklist personalizado</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Atribuição de responsáveis</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Acompanhamento em tempo real</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="foome-card border-none hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 pt-8">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de Empresas</h3>
                <p className="text-muted-foreground mb-4">
                  Suporte a múltiplas empresas e filiais, com controle de acesso e personalização por unidade.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Estrutura multi-empresas</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Controle de acesso por empresa</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Relatórios consolidados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="foome-card border-none hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 pt-8">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dashboard e Relatórios</h3>
                <p className="text-muted-foreground mb-4">
                  Visualização clara e objetiva dos principais indicadores de RH, com relatórios personalizáveis.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Dashboard interativo</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Relatórios personalizáveis</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Exportação em diversos formatos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-16 md:py-24 bg-muted/30">
        <div className="foome-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-4">
              DEPOIMENTOS
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">O que nossos clientes dizem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja como a Foome tem transformado a gestão de RH em diversas empresas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Depoimento 1 */}
            <Card className="foome-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=48&width=48&text=MR"
                      alt="Maria Rodrigues"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Maria Rodrigues</h4>
                    <p className="text-sm text-muted-foreground">Gerente de RH, Empresa ABC</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "A Foome transformou completamente nossos processos de RH. Antes, gastávamos horas com planilhas e
                  documentos físicos. Agora, tudo é feito de forma rápida e eficiente na plataforma."
                </p>
              </CardContent>
            </Card>

            {/* Depoimento 2 */}
            <Card className="foome-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=48&width=48&text=JS"
                      alt="João Silva"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">João Silva</h4>
                    <p className="text-sm text-muted-foreground">Diretor Financeiro, Empresa XYZ</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "A redução de custos operacionais foi impressionante. Além disso, a transparência nos processos
                  melhorou significativamente a satisfação dos nossos colaboradores."
                </p>
              </CardContent>
            </Card>

            {/* Depoimento 3 */}
            <Card className="foome-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=48&width=48&text=AP"
                      alt="Ana Paula"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Ana Paula</h4>
                    <p className="text-sm text-muted-foreground">Analista de RH, Empresa 123</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "O módulo de onboarding é fantástico! Nossos novos funcionários têm uma experiência muito melhor desde
                  o primeiro dia, e a equipe de RH economiza horas de trabalho."
                </p>
              </CardContent>
            </Card>

            {/* Depoimento 4 */}
            <Card className="foome-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=48&width=48&text=CS"
                      alt="Carlos Santos"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Carlos Santos</h4>
                    <p className="text-sm text-muted-foreground">Funcionário, Empresa ABC</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Como funcionário, adoro a facilidade para solicitar férias e acessar meus documentos. Tudo é muito
                  intuitivo e rápido, sem burocracia."
                </p>
              </CardContent>
            </Card>

            {/* Depoimento 5 */}
            <Card className="foome-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=48&width=48&text=LM"
                      alt="Luciana Mendes"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Luciana Mendes</h4>
                    <p className="text-sm text-muted-foreground">CEO, Empresa XYZ</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "A visibilidade que temos agora sobre os dados de RH nos permite tomar decisões estratégicas muito
                  mais embasadas. O ROI foi muito além do esperado."
                </p>
              </CardContent>
            </Card>

            {/* Depoimento 6 */}
            <Card className="foome-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=48&width=48&text=RF"
                      alt="Roberto Ferreira"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Roberto Ferreira</h4>
                    <p className="text-sm text-muted-foreground">Coordenador de RH, Empresa 123</p>
                  </div>
                </div>
                <div className="mb-3 flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "O suporte da equipe Foome é excepcional. Sempre que temos dúvidas ou sugestões, somos atendidos
                  rapidamente e com muita atenção."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contato" className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="foome-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                ENTRE EM CONTATO
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Pronto para transformar a gestão de RH da sua empresa?
              </h2>
              <p className="text-muted-foreground">
                Preencha o formulário ao lado e um de nossos consultores entrará em contato para uma demonstração
                personalizada da plataforma Foome.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">contato@foome.com.br</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Telefone</h3>
                    <p className="text-sm text-muted-foreground">(11) 4567-8901</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Endereço</h3>
                    <p className="text-sm text-muted-foreground">Av. Paulista, 1000 - São Paulo, SP</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Card className="foome-card border-none">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Solicite uma demonstração</h3>
                    <p className="text-sm text-muted-foreground">Preencha o formulário abaixo para conhecer a Foome</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Nome
                        </label>
                        <Input id="name" placeholder="Seu nome" className="foome-input" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium">
                          Empresa
                        </label>
                        <Input id="company" placeholder="Sua empresa" className="foome-input" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="seu@email.com" className="foome-input" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Telefone
                      </label>
                      <Input id="phone" placeholder="(11) 98765-4321" className="foome-input" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Mensagem
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Como podemos ajudar?"
                        className="foome-input resize-none"
                        rows={4}
                      />
                    </div>
                    <Button className="w-full">Solicitar demonstração</Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Ao enviar este formulário, você concorda com nossa{" "}
                      <a href="#" className="underline hover:text-primary">
                        Política de Privacidade
                      </a>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white dark:bg-gray-950">
        <div className="foome-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo width={120} height={40} />
              <p className="text-sm text-muted-foreground">
                Simplificando a gestão de funcionários para empresas de todos os tamanhos.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-primary">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Integrações
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Atualizações
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Carreiras
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Clientes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Parceiros
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Foome. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Termos de Serviço
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Política de Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

