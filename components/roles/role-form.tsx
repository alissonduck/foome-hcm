/**
 * Componente de formulário para criar ou editar cargo
 * Permite preencher todos os detalhes de um cargo
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRoles } from "@/hooks/use-roles"
import { useTeams } from "@/hooks/use-teams"
import { roleFormSchema, type RoleFormValues } from "@/lib/schemas/role-schema"
import {
  CONTRACT_TYPES,
  SALARY_PERIODICITIES,
  CNH_TYPES,
  WORK_MODELS,
  ROLE_LEVELS,
  SENIORITY_LEVELS,
  EDUCATION_LEVELS,
  EDUCATION_STATUSES,
  SKILL_LEVELS,
} from "@/lib/types/roles"
import { type TeamWithManager } from "@/lib/types/teams"

interface RoleFormProps {
  companyId: string
  initialData?: RoleFormValues & { id?: string }
  isEditing?: boolean
}

export function RoleForm({ companyId, initialData, isEditing = false }: RoleFormProps) {
  const router = useRouter()
  const { useCreateRoleMutation, useUpdateRoleMutation } = useRoles()
  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const isCreatingRole = createMutation.isPending
  const isUpdatingRole = updateMutation.isPending
  
  // Estado para armazenar as equipes
  const [teams, setTeams] = useState<TeamWithManager[]>([])
  const [teamsLoading, setTeamsLoading] = useState(false)
  
  // Efeito para carregar as equipes ao montar o componente
  useEffect(() => {
    async function loadTeams() {
      try {
        setTeamsLoading(true)
        // Chamar a server action via uma função de cliente
        const response = await fetch("/api/teams")
        
        if (!response.ok) {
          throw new Error("Falha ao carregar equipes")
        }
        
        const teamsData = await response.json()
        setTeams(teamsData)
      } catch (error) {
        console.error("Erro ao carregar equipes:", error)
      } finally {
        setTeamsLoading(false)
      }
    }
    
    loadTeams()
  }, [companyId])

  const [courses, setCourses] = useState<{ id?: string; name: string; is_required: boolean }[]>(
    initialData?.courses || [],
  )
  const [complementaryCourses, setComplementaryCourses] = useState<{ id?: string; name: string }[]>(
    initialData?.complementary_courses || [],
  )
  const [technicalSkills, setTechnicalSkills] = useState<{ id?: string; name: string; level: string | null }[]>(
    initialData?.technical_skills?.map(skill => ({
      ...skill,
      level: skill.level || null
    })) || [],
  )
  const [behavioralSkills, setBehavioralSkills] = useState<{ id?: string; name: string; level: string | null }[]>(
    initialData?.behavioral_skills?.map(skill => ({
      ...skill,
      level: skill.level || null
    })) || [],
  )
  const [languages, setLanguages] = useState<
    { id?: string; name: string; level: string | null; is_required: boolean }[]
  >(initialData?.languages?.map(lang => ({
    ...lang,
    level: lang.level || null
  })) || [])

  const [newCourse, setNewCourse] = useState("")
  const [newComplementaryCourse, setNewComplementaryCourse] = useState("")
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("")
  const [newTechnicalSkillLevel, setNewTechnicalSkillLevel] = useState<string | null>(null)
  const [newBehavioralSkill, setNewBehavioralSkill] = useState("")
  const [newBehavioralSkillLevel, setNewBehavioralSkillLevel] = useState<string | null>(null)
  const [newLanguage, setNewLanguage] = useState("")
  const [newLanguageLevel, setNewLanguageLevel] = useState<string | null>(null)
  const [newLanguageRequired, setNewLanguageRequired] = useState(false)
  const [newCourseRequired, setNewCourseRequired] = useState(false)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: initialData || {
      company_id: companyId,
      title: "",
      cbo_name: null,
      cbo_number: null,
      contract_type: "clt",
      active: true,
      team_id: null,
      description: null,
      salary_periodicity: null,
      salary: null,
      cnh: null,
      work_model: null,
      level: null,
      seniority_level: null,
      seniority_scale: null,
      required_requirements: null,
      desired_requirements: null,
      deliveries_results: null,
      education_level: null,
      education_status: null,
      courses: [],
      complementary_courses: [],
      technical_skills: [],
      behavioral_skills: [],
      languages: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      setCourses(initialData.courses || [])
      setComplementaryCourses(initialData.complementary_courses || [])
      setTechnicalSkills(initialData.technical_skills?.map(skill => ({
        ...skill,
        level: skill.level || null
      })) || [])
      setBehavioralSkills(initialData.behavioral_skills?.map(skill => ({
        ...skill,
        level: skill.level || null
      })) || [])
      setLanguages(initialData.languages?.map(lang => ({
        ...lang,
        level: lang.level || null
      })) || [])
    }
  }, [initialData])

  const onSubmit = (data: RoleFormValues) => {
    const formData = {
      ...data,
      cnh: data.cnh === "no_cnh" ? null : data.cnh,
      team_id: data.team_id === "none" ? null : data.team_id,
      courses,
      complementary_courses: complementaryCourses,
      technical_skills: technicalSkills.map(skill => ({
        ...skill,
        level: skill.level === "none" ? null : skill.level
      })),
      behavioral_skills: behavioralSkills.map(skill => ({
        ...skill,
        level: skill.level === "none" ? null : skill.level
      })),
      languages: languages.map(lang => ({
        ...lang,
        level: lang.level === "none" ? null : lang.level
      })),
    }

    if (isEditing && initialData?.id) {
      updateMutation.mutate({ roleId: initialData.id, params: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setCourses([...courses, { name: newCourse.trim(), is_required: newCourseRequired }])
      setNewCourse("")
      setNewCourseRequired(false)
    }
  }

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index))
  }

  const handleAddComplementaryCourse = () => {
    if (newComplementaryCourse.trim()) {
      setComplementaryCourses([...complementaryCourses, { name: newComplementaryCourse.trim() }])
      setNewComplementaryCourse("")
    }
  }

  const handleRemoveComplementaryCourse = (index: number) => {
    setComplementaryCourses(complementaryCourses.filter((_, i) => i !== index))
  }

  const handleAddTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      setTechnicalSkills([
        ...technicalSkills, 
        { 
          name: newTechnicalSkill.trim(), 
          level: newTechnicalSkillLevel === "none" ? null : newTechnicalSkillLevel 
        }
      ])
      setNewTechnicalSkill("")
      setNewTechnicalSkillLevel(null)
    }
  }

  const handleRemoveTechnicalSkill = (index: number) => {
    setTechnicalSkills(technicalSkills.filter((_, i) => i !== index))
  }

  const handleAddBehavioralSkill = () => {
    if (newBehavioralSkill.trim()) {
      setBehavioralSkills([
        ...behavioralSkills, 
        { 
          name: newBehavioralSkill.trim(), 
          level: newBehavioralSkillLevel === "none" ? null : newBehavioralSkillLevel 
        }
      ])
      setNewBehavioralSkill("")
      setNewBehavioralSkillLevel(null)
    }
  }

  const handleRemoveBehavioralSkill = (index: number) => {
    setBehavioralSkills(behavioralSkills.filter((_, i) => i !== index))
  }

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      setLanguages([
        ...languages,
        {
          name: newLanguage.trim(),
          level: newLanguageLevel === "none" ? null : newLanguageLevel,
          is_required: newLanguageRequired,
        },
      ])
      setNewLanguage("")
      setNewLanguageLevel(null)
      setNewLanguageRequired(false)
    }
  }

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="requirements">Requisitos</TabsTrigger>
            <TabsTrigger value="skills">Habilidades</TabsTrigger>
            <TabsTrigger value="education">Educação</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desenvolvedor Full Stack" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contract_type"
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
                        {CONTRACT_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cbo_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome CBO</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Analista de Sistemas"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>Nome da ocupação conforme a Classificação Brasileira de Ocupações</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cbo_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número CBO</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 2124-05"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Código da ocupação conforme a Classificação Brasileira de Ocupações
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={teamsLoading ? "Carregando equipes..." : "Selecione a equipe"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma equipe</SelectItem>
                        {teams && teams.length > 0 ? (
                          teams.map((team: TeamWithManager) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_teams" disabled>
                            {teamsLoading ? "Carregando equipes..." : "Nenhuma equipe encontrada"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione a equipe à qual este cargo pertence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status do Cargo</FormLabel>
                      <FormDescription>Cargo ativo aparece nas listagens padrão</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Cargo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as responsabilidades e o escopo do cargo"
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 5000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_periodicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidade do Salário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a periodicidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SALARY_PERIODICITIES.map((periodicity) => (
                          <SelectItem key={periodicity} value={periodicity} className="capitalize">
                            {periodicity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNH</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de CNH" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no_cnh">Não requer CNH</SelectItem>
                        {CNH_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="uppercase">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Trabalho</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo de trabalho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORK_MODELS.map((model) => (
                          <SelectItem key={model} value={model} className="capitalize">
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level} className="capitalize">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seniority_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Senioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível de senioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SENIORITY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level} className="capitalize">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seniority_scale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escala de Senioridade (1-10)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      defaultValue={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a escala" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(10)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="required_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requisitos Obrigatórios</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os requisitos obrigatórios para o cargo"
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desired_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requisitos Desejáveis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os requisitos desejáveis para o cargo"
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveries_results"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entregas e Resultados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as entregas e resultados esperados para o cargo"
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Habilidades Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                      {skill.name}
                      {skill.level && ` (${skill.level})`}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full"
                        onClick={() => handleRemoveTechnicalSkill(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Nova habilidade técnica"
                    value={newTechnicalSkill}
                    onChange={(e) => setNewTechnicalSkill(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={newTechnicalSkillLevel || ""}
                    onValueChange={(value) => setNewTechnicalSkillLevel(value || null)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem nível</SelectItem>
                      {SKILL_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddTechnicalSkill}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Habilidades Comportamentais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {behavioralSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                      {skill.name}
                      {skill.level && ` (${skill.level})`}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full"
                        onClick={() => handleRemoveBehavioralSkill(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Nova habilidade comportamental"
                    value={newBehavioralSkill}
                    onChange={(e) => setNewBehavioralSkill(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={newBehavioralSkillLevel || ""}
                    onValueChange={(value) => setNewBehavioralSkillLevel(value || null)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem nível</SelectItem>
                      {SKILL_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddBehavioralSkill}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Idiomas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {languages.map((language, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                      {language.name}
                      {language.level && ` (${language.level})`}
                      {language.is_required && " (Obrigatório)"}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full"
                        onClick={() => handleRemoveLanguage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Novo idioma"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={newLanguageLevel || ""}
                      onValueChange={(value) => setNewLanguageLevel(value || null)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem nível</SelectItem>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level} value={level} className="capitalize">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="language-required"
                        checked={newLanguageRequired}
                        onCheckedChange={(checked) => setNewLanguageRequired(checked === true)}
                      />
                      <label
                        htmlFor="language-required"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Obrigatório
                      </label>
                    </div>
                    <Button type="button" onClick={handleAddLanguage}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Escolaridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível de escolaridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level} className="capitalize">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação da Graduação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a situação da graduação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDUCATION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {courses.map((course, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                      {course.name}
                      {course.is_required && " (Obrigatório)"}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full"
                        onClick={() => handleRemoveCourse(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Novo curso"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="course-required"
                      checked={newCourseRequired}
                      onCheckedChange={(checked) => setNewCourseRequired(checked === true)}
                    />
                    <label
                      htmlFor="course-required"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Obrigatório
                    </label>
                  </div>
                  <Button type="button" onClick={handleAddCourse}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cursos Complementares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {complementaryCourses.map((course, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                      {course.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full"
                        onClick={() => handleRemoveComplementaryCourse(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Novo curso complementar"
                    value={newComplementaryCourse}
                    onChange={(e) => setNewComplementaryCourse(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddComplementaryCourse}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreatingRole || isUpdatingRole}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Atualizar" : "Criar"} Cargo
          </Button>
        </div>
      </form>
    </Form>
  )
}

