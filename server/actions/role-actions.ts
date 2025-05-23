"use server"

/**
 * Server actions para gerenciamento de cargos
 * Fornece ações do servidor para operações com cargos
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import type {
  Role,
  RoleCourse,
  RoleComplementaryCourse,
  RoleTechnicalSkill,
  RoleBehavioralSkill,
  RoleLanguage,
  RoleEmployeeInsert,
  RoleWithTeam,
  RoleWithDetails,
  RoleEmployeeWithDetails,
} from "@/lib/types/roles"
import type { RoleFormValues } from "@/lib/schemas/role-schema"
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"

/**
 * Obtém todos os cargos de uma empresa
 * @param includeInactive Incluir cargos inativos
 * @returns Lista de cargos
 */
export async function getRoles(includeInactive = false): Promise<RoleWithTeam[]> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    let query = (await createClient())
      .from("roles")
      .select(`
        *,
        team:teams(
          id, name
        )
      `)
      .eq("company_id", company.id)
      .order("title")

    if (!includeInactive) {
      query = query.eq("active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar cargos:", error)
      throw new Error("Não foi possível buscar os cargos")
    }

    return data as unknown as RoleWithTeam[]
  } catch (error) {
    console.error("Erro ao buscar cargos:", error)
    throw new Error(`Não foi possível buscar os cargos: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém um cargo específico com todos os detalhes
 * @param roleId ID do cargo
 * @returns Detalhes do cargo
 */
export async function getRoleWithDetails(roleId: string): Promise<RoleWithDetails> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca o cargo com a equipe
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select(`
        *,
        team:teams(
          id, name
        )
      `)
      .eq("id", roleId)
      .single()

    if (roleError) {
      console.error("Erro ao buscar cargo:", roleError)
      throw new Error("Não foi possível buscar os detalhes do cargo")
    }
    
    // Verifica se o cargo pertence à empresa do usuário
    if (role.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }

    // Busca os cursos do cargo
    const { data: courses, error: coursesError } = await supabase
      .from("role_courses")
      .select("*")
      .eq("role_id", roleId)

    if (coursesError) {
      console.error("Erro ao buscar cursos do cargo:", coursesError)
      throw new Error("Não foi possível buscar os cursos do cargo")
    }

    // Busca os cursos complementares do cargo
    const { data: complementaryCourses, error: complementaryCoursesError } = await supabase
      .from("role_complementary_courses")
      .select("*")
      .eq("role_id", roleId)

    if (complementaryCoursesError) {
      console.error("Erro ao buscar cursos complementares do cargo:", complementaryCoursesError)
      throw new Error("Não foi possível buscar os cursos complementares do cargo")
    }

    // Busca as habilidades técnicas do cargo
    const { data: technicalSkills, error: technicalSkillsError } = await supabase
      .from("role_technical_skills")
      .select("*")
      .eq("role_id", roleId)

    if (technicalSkillsError) {
      console.error("Erro ao buscar habilidades técnicas do cargo:", technicalSkillsError)
      throw new Error("Não foi possível buscar as habilidades técnicas do cargo")
    }

    // Busca as habilidades comportamentais do cargo
    const { data: behavioralSkills, error: behavioralSkillsError } = await supabase
      .from("role_behavioral_skills")
      .select("*")
      .eq("role_id", roleId)

    if (behavioralSkillsError) {
      console.error("Erro ao buscar habilidades comportamentais do cargo:", behavioralSkillsError)
      throw new Error("Não foi possível buscar as habilidades comportamentais do cargo")
    }

    // Busca os idiomas do cargo
    const { data: languages, error: languagesError } = await supabase
      .from("role_languages")
      .select("*")
      .eq("role_id", roleId)

    if (languagesError) {
      console.error("Erro ao buscar idiomas do cargo:", languagesError)
      throw new Error("Não foi possível buscar os idiomas do cargo")
    }

    // Conta quantos funcionários estão atualmente neste cargo
    const { count, error: countError } = await supabase
      .from("employee_roles")
      .select("*", { count: "exact", head: true })
      .eq("role_id", roleId)
      .eq("is_current", true)

    if (countError) {
      console.error("Erro ao contar funcionários do cargo:", countError)
      throw new Error("Não foi possível contar os funcionários do cargo")
    }

    return {
      ...(role as unknown as RoleWithTeam),
      courses: courses as RoleCourse[],
      complementary_courses: complementaryCourses as RoleComplementaryCourse[],
      technical_skills: technicalSkills as RoleTechnicalSkill[],
      behavioral_skills: behavioralSkills as RoleBehavioralSkill[],
      languages: languages as RoleLanguage[],
      employees_count: count || 0,
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes do cargo:", error)
    throw new Error(`Não foi possível buscar os detalhes do cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém o histórico de cargos de um funcionário
 * @param employeeId ID do funcionário
 * @returns Histórico de cargos
 */
export async function getEmployeeRoleHistory(employeeId: string): Promise<RoleEmployeeWithDetails[]> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("company_id")
      .eq("id", employeeId)
      .single()
      
    if (employeeError || !employee) {
      console.error("Erro ao verificar funcionário:", employeeError)
      throw new Error("Funcionário não encontrado")
    }
    
    if (employee.company_id !== company.id) {
      throw new Error("Este funcionário não pertence à sua empresa")
    }
    
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        employee:employees(
          id, full_name, email, position
        ),
        role:roles(
          id, title, contract_type
        )
      `)
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Erro ao buscar histórico de cargos:", error)
      throw new Error("Não foi possível buscar o histórico de cargos")
    }

    return data as unknown as RoleEmployeeWithDetails[]
  } catch (error) {
    console.error("Erro ao buscar histórico de cargos:", error)
    throw new Error(`Não foi possível buscar o histórico de cargos: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém os funcionários atuais de um cargo
 * @param roleId ID do cargo
 * @returns Lista de funcionários
 */
export async function getRoleEmployees(roleId: string): Promise<RoleEmployeeWithDetails[]> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
      
    if (roleError || !role) {
      console.error("Erro ao verificar cargo:", roleError)
      throw new Error("Cargo não encontrado")
    }
    
    if (role.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }
    
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        employee:employees(
          id, full_name, email, position
        ),
        role:roles(
          id, title, contract_type
        )
      `)
      .eq("role_id", roleId)
      .eq("is_current", true)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Erro ao buscar funcionários do cargo:", error)
      throw new Error("Não foi possível buscar os funcionários do cargo")
    }

    return data as unknown as RoleEmployeeWithDetails[]
  } catch (error) {
    console.error("Erro ao buscar funcionários do cargo:", error)
    throw new Error(`Não foi possível buscar os funcionários do cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Cria um novo cargo com todos os detalhes
 * @param roleForm Dados do formulário de cargo
 * @returns Cargo criado
 */
export async function createRole(roleForm: RoleFormValues): Promise<Role> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem criar cargos")
    }
    
    const supabase = await createClient()
    
    // Garante que o cargo será criado para a empresa do usuário
    roleForm.company_id = company.id
    
    // Cria o cargo
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .insert({
        company_id: roleForm.company_id,
        title: roleForm.title,
        cbo_name: roleForm.cbo_name,
        cbo_number: roleForm.cbo_number,
        contract_type: roleForm.contract_type,
        active: roleForm.active,
        team_id: roleForm.team_id,
        description: roleForm.description,
        salary_periodicity: roleForm.salary_periodicity,
        salary: roleForm.salary,
        cnh: roleForm.cnh,
        work_model: roleForm.work_model,
        level: roleForm.level,
        seniority_level: roleForm.seniority_level,
        seniority_scale: roleForm.seniority_scale,
        required_requirements: roleForm.required_requirements,
        desired_requirements: roleForm.desired_requirements,
        deliveries_results: roleForm.deliveries_results,
        education_level: roleForm.education_level,
        education_status: roleForm.education_status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (roleError) {
      console.error("Erro ao criar cargo:", roleError)
      throw new Error("Não foi possível criar o cargo")
    }
    
    // Insere os cursos
    if (roleForm.courses && roleForm.courses.length > 0) {
      const coursesData = roleForm.courses.map((course) => ({
        role_id: role.id,
        name: course.name,
        is_required: course.is_required,
      }))
      
      const { error: coursesError } = await supabase
        .from("role_courses")
        .insert(coursesData)
      
      if (coursesError) {
        console.error("Erro ao inserir cursos:", coursesError)
      }
    }
    
    // Insere os cursos complementares
    if (roleForm.complementary_courses && roleForm.complementary_courses.length > 0) {
      const complementaryCoursesData = roleForm.complementary_courses.map((course) => ({
        role_id: role.id,
        name: course.name,
      }))
      
      const { error: complementaryCoursesError } = await supabase
        .from("role_complementary_courses")
        .insert(complementaryCoursesData)
      
      if (complementaryCoursesError) {
        console.error("Erro ao inserir cursos complementares:", complementaryCoursesError)
      }
    }
    
    // Insere as habilidades técnicas
    if (roleForm.technical_skills && roleForm.technical_skills.length > 0) {
      const technicalSkillsData = roleForm.technical_skills.map((skill) => ({
        role_id: role.id,
        name: skill.name,
        level: skill.level === "none" ? null : skill.level,
      }))
      
      const { error: technicalSkillsError } = await supabase
        .from("role_technical_skills")
        .insert(technicalSkillsData)
      
      if (technicalSkillsError) {
        console.error("Erro ao inserir habilidades técnicas:", technicalSkillsError)
      }
    }
    
    // Insere as habilidades comportamentais
    if (roleForm.behavioral_skills && roleForm.behavioral_skills.length > 0) {
      const behavioralSkillsData = roleForm.behavioral_skills.map((skill) => ({
        role_id: role.id,
        name: skill.name,
        level: skill.level === "none" ? null : skill.level,
      }))
      
      const { error: behavioralSkillsError } = await supabase
        .from("role_behavioral_skills")
        .insert(behavioralSkillsData)
      
      if (behavioralSkillsError) {
        console.error("Erro ao inserir habilidades comportamentais:", behavioralSkillsError)
      }
    }
    
    // Insere os idiomas
    if (roleForm.languages && roleForm.languages.length > 0) {
      const languagesData = roleForm.languages.map((language) => ({
        role_id: role.id,
        name: language.name,
        level: language.level === "none" ? null : language.level,
        is_required: language.is_required,
      }))
      
      const { error: languagesError } = await supabase
        .from("role_languages")
        .insert(languagesData)
      
      if (languagesError) {
        console.error("Erro ao inserir idiomas:", languagesError)
      }
    }
    
    // Revalida as páginas de cargos
    revalidatePath("/dashboard/roles")
    
    return role
  } catch (error) {
    console.error("Erro ao criar cargo:", error)
    throw new Error(`Não foi possível criar o cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Atualiza um cargo existente com todos os detalhes
 * @param roleId ID do cargo
 * @param roleForm Dados do formulário de cargo
 * @returns Cargo atualizado
 */
export async function updateRole(roleId: string, roleForm: RoleFormValues): Promise<Role> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar cargos")
    }
    
    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
    
    if (existingRoleError || !existingRole) {
      throw new Error("Cargo não encontrado")
    }
    
    if (existingRole.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }
    
    // Atualiza o cargo
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .update({
        title: roleForm.title,
        cbo_name: roleForm.cbo_name,
        cbo_number: roleForm.cbo_number,
        contract_type: roleForm.contract_type,
        active: roleForm.active,
        team_id: roleForm.team_id,
        description: roleForm.description,
        salary_periodicity: roleForm.salary_periodicity,
        salary: roleForm.salary,
        cnh: roleForm.cnh,
        work_model: roleForm.work_model,
        level: roleForm.level,
        seniority_level: roleForm.seniority_level,
        seniority_scale: roleForm.seniority_scale,
        required_requirements: roleForm.required_requirements,
        desired_requirements: roleForm.desired_requirements,
        deliveries_results: roleForm.deliveries_results,
        education_level: roleForm.education_level,
        education_status: roleForm.education_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roleId)
      .select()
      .single()
    
    if (roleError) {
      console.error("Erro ao atualizar cargo:", roleError)
      throw new Error("Não foi possível atualizar o cargo")
    }
    
    // Atualiza os cursos (remove todos e adiciona novamente)
    const { error: deleteCoursesError } = await supabase
      .from("role_courses")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteCoursesError) {
      console.error("Erro ao excluir cursos existentes:", deleteCoursesError)
    }
    
    if (roleForm.courses && roleForm.courses.length > 0) {
      const coursesData = roleForm.courses.map((course) => ({
        role_id: roleId,
        name: course.name,
        is_required: course.is_required,
      }))
      
      const { error: coursesError } = await supabase
        .from("role_courses")
        .insert(coursesData)
      
      if (coursesError) {
        console.error("Erro ao inserir cursos:", coursesError)
      }
    }
    
    // Atualiza os cursos complementares (remove todos e adiciona novamente)
    const { error: deleteComplementaryCoursesError } = await supabase
      .from("role_complementary_courses")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteComplementaryCoursesError) {
      console.error("Erro ao excluir cursos complementares existentes:", deleteComplementaryCoursesError)
    }
    
    if (roleForm.complementary_courses && roleForm.complementary_courses.length > 0) {
      const complementaryCoursesData = roleForm.complementary_courses.map((course) => ({
        role_id: roleId,
        name: course.name,
      }))
      
      const { error: complementaryCoursesError } = await supabase
        .from("role_complementary_courses")
        .insert(complementaryCoursesData)
      
      if (complementaryCoursesError) {
        console.error("Erro ao inserir cursos complementares:", complementaryCoursesError)
      }
    }
    
    // Atualiza as habilidades técnicas (remove todas e adiciona novamente)
    const { error: deleteTechnicalSkillsError } = await supabase
      .from("role_technical_skills")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteTechnicalSkillsError) {
      console.error("Erro ao excluir habilidades técnicas existentes:", deleteTechnicalSkillsError)
    }
    
    if (roleForm.technical_skills && roleForm.technical_skills.length > 0) {
      const technicalSkillsData = roleForm.technical_skills.map((skill) => ({
        role_id: roleId,
        name: skill.name,
        level: skill.level === "none" ? null : skill.level,
      }))
      
      const { error: technicalSkillsError } = await supabase
        .from("role_technical_skills")
        .insert(technicalSkillsData)
      
      if (technicalSkillsError) {
        console.error("Erro ao inserir habilidades técnicas:", technicalSkillsError)
      }
    }
    
    // Atualiza as habilidades comportamentais (remove todas e adiciona novamente)
    const { error: deleteBehavioralSkillsError } = await supabase
      .from("role_behavioral_skills")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteBehavioralSkillsError) {
      console.error("Erro ao excluir habilidades comportamentais existentes:", deleteBehavioralSkillsError)
    }
    
    if (roleForm.behavioral_skills && roleForm.behavioral_skills.length > 0) {
      const behavioralSkillsData = roleForm.behavioral_skills.map((skill) => ({
        role_id: roleId,
        name: skill.name,
        level: skill.level === "none" ? null : skill.level,
      }))
      
      const { error: behavioralSkillsError } = await supabase
        .from("role_behavioral_skills")
        .insert(behavioralSkillsData)
      
      if (behavioralSkillsError) {
        console.error("Erro ao inserir habilidades comportamentais:", behavioralSkillsError)
      }
    }
    
    // Atualiza os idiomas (remove todos e adiciona novamente)
    const { error: deleteLanguagesError } = await supabase
      .from("role_languages")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteLanguagesError) {
      console.error("Erro ao excluir idiomas existentes:", deleteLanguagesError)
    }
    
    if (roleForm.languages && roleForm.languages.length > 0) {
      const languagesData = roleForm.languages.map((language) => ({
        role_id: roleId,
        name: language.name,
        level: language.level === "none" ? null : language.level,
        is_required: language.is_required,
      }))
      
      const { error: languagesError } = await supabase
        .from("role_languages")
        .insert(languagesData)
      
      if (languagesError) {
        console.error("Erro ao inserir idiomas:", languagesError)
      }
    }
    
    // Revalida as páginas de cargos
    revalidatePath("/dashboard/roles")
    revalidatePath(`/dashboard/roles/${roleId}`)
    
    return role
  } catch (error) {
    console.error("Erro ao atualizar cargo:", error)
    throw new Error(`Não foi possível atualizar o cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Ativa ou desativa um cargo
 * @param roleId ID do cargo
 * @param active Flag para indicar se o cargo deve ser ativado
 * @returns Status da operação
 */
export async function toggleRoleActive(roleId: string, active: boolean): Promise<boolean> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem ativar/desativar cargos")
    }
    
    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
    
    if (existingRoleError || !existingRole) {
      throw new Error("Cargo não encontrado")
    }
    
    if (existingRole.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }
    
    const { error } = await supabase
      .from("roles")
      .update({
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roleId)
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas de cargos
    revalidatePath("/dashboard/roles")
    revalidatePath(`/dashboard/roles/${roleId}`)
    
    return true
  } catch (error) {
    console.error("Erro ao ativar/desativar cargo:", error)
    throw new Error(`Não foi possível ativar/desativar o cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Exclui um cargo
 * @param roleId ID do cargo
 * @returns Verdadeiro se a exclusão for bem-sucedida
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem excluir cargos")
    }
    
    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
    
    if (roleError || !role) {
      console.error("Erro ao verificar cargo:", roleError)
      throw new Error("Cargo não encontrado")
    }
    
    if (role.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }
    
    // Verifica se há funcionários atualmente neste cargo
    const { count, error: countError } = await supabase
      .from("employee_roles")
      .select("*", { count: "exact", head: true })
      .eq("role_id", roleId)
      .eq("is_current", true)
    
    if (countError) {
      console.error("Erro ao verificar funcionários do cargo:", countError)
      throw new Error("Não foi possível verificar os funcionários do cargo")
    }
    
    if (count && count > 0) {
      throw new Error("Não é possível excluir um cargo que possui funcionários ativos")
    }

    // Remove todos os registros relacionados
    const tables = [
      "role_languages",
      "role_behavioral_skills",
      "role_technical_skills",
      "role_complementary_courses",
      "role_courses",
      "employee_roles"
    ]
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("role_id", roleId)
      
      if (error) {
        console.error(`Erro ao remover dados da tabela ${table}:`, error)
        throw error
      }
    }
    
    // Exclui o cargo após remover todas as dependências
    const { error: deleteError } = await supabase
      .from("roles")
      .delete()
      .eq("id", roleId)
    
    if (deleteError) {
      console.error("Erro ao excluir cargo:", deleteError)
      throw deleteError
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/roles")
    
    return true
  } catch (error) {
    console.error("Erro ao excluir cargo:", error)
    throw new Error(`Não foi possível excluir o cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Server action para criar um cargo a partir de FormData
 * @param formData Dados do formulário
 * @returns Resposta com o cargo criado ou erro
 */
export async function createRoleFromForm(formData: FormData): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem criar cargos"
      })
    }

    // Extrair dados do formulário
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const teamId = formData.get("teamId") as string
    const contractType = formData.get("contractType") as string

    if (!title) {
      return constructServerResponse({
        success: false,
        error: "O título do cargo é obrigatório"
      })
    }

    const supabase = await createClient()
    
    // Inserir o novo cargo
    const { data, error } = await supabase
      .from("roles")
      .insert({
        company_id: company.id,
        title,
        description,
        team_id: teamId || null,
        contract_type: contractType,
        created_by: company.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar cargo:", error)
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    // Revalidar o caminho para atualizar os dados
    revalidatePath("/dashboard/roles")

    return constructServerResponse({
      success: true,
      data,
      message: "Cargo criado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao criar cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar cargo"
    })
  }
}

/**
 * Server action para atualizar um cargo existente a partir de FormData
 * @param id ID do cargo
 * @param formData Dados do formulário
 * @returns Resposta com o cargo atualizado ou erro
 */
export async function updateRoleFromForm(id: string, formData: FormData): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem atualizar cargos"
      })
    }

    // Extrair dados do formulário
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const teamId = formData.get("teamId") as string
    const contractType = formData.get("contractType") as string

    if (!title) {
      return constructServerResponse({
        success: false,
        error: "O título do cargo é obrigatório"
      })
    }

    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", id)
      .single()
    
    if (existingRoleError || !existingRole) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado"
      })
    }
    
    if (existingRole.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este cargo não pertence à sua empresa"
      })
    }

    // Atualizar o cargo
    const { data, error } = await supabase
      .from("roles")
      .update({
        title,
        description,
        team_id: teamId || null,
        contract_type: contractType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar cargo:", error)
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath("/dashboard/roles")
    revalidatePath(`/dashboard/roles/${id}`)

    return constructServerResponse({
      success: true,
      data,
      message: "Cargo atualizado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar cargo"
    })
  }
}

/**
 * Server action para alternar o status de atividade de um cargo
 * @param id ID do cargo
 * @returns Resposta com o cargo atualizado ou erro
 */
export async function toggleRoleActiveById(id: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem ativar/desativar cargos"
      })
    }

    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("roles")
      .select("company_id, active")
      .eq("id", id)
      .single()
    
    if (existingRoleError || !existingRole) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado"
      })
    }
    
    if (existingRole.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este cargo não pertence à sua empresa"
      })
    }

    // Alternar o status
    const { data, error } = await supabase
      .from("roles")
      .update({
        active: !existingRole.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao alternar status do cargo:", error)
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath("/dashboard/roles")
    revalidatePath(`/dashboard/roles/${id}`)

    return constructServerResponse({
      success: true,
      data,
      message: `Cargo ${data.active ? 'ativado' : 'desativado'} com sucesso`
    })
  } catch (error) {
    console.error("Erro ao alternar status do cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao alternar status do cargo"
    })
  }
}

/**
 * Server action para excluir um cargo
 * @param id ID do cargo
 * @returns Resposta de sucesso ou erro
 */
export async function deleteRoleById(id: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem excluir cargos"
      })
    }

    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa do usuário
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", id)
      .single()
    
    if (existingRoleError || !existingRole) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado"
      })
    }
    
    if (existingRole.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este cargo não pertence à sua empresa"
      })
    }

    // Verificar se há funcionários vinculados ao cargo
    const { count, error: countError } = await supabase
      .from("employee_roles")
      .select("id", { count: "exact", head: true })
      .eq("role_id", id)
      .eq("is_current", true)

    if (countError) {
      console.error("Erro ao verificar funcionários vinculados:", countError)
      return constructServerResponse({
        success: false,
        error: countError.message
      })
    }

    if (count && count > 0) {
      return constructServerResponse({
        success: false,
        error: "Não é possível excluir um cargo com funcionários ativos"
      })
    }
    
    // Exclui os registros relacionados (usando uma transação manual)
    
    // 1. Exclui cursos
    const { error: deleteCoursesError } = await supabase
      .from("role_courses")
      .delete()
      .eq("role_id", id)
    
    if (deleteCoursesError) {
      console.error("Erro ao excluir cursos:", deleteCoursesError)
    }
    
    // 2. Exclui cursos complementares
    const { error: deleteComplementaryCoursesError } = await supabase
      .from("role_complementary_courses")
      .delete()
      .eq("role_id", id)
    
    if (deleteComplementaryCoursesError) {
      console.error("Erro ao excluir cursos complementares:", deleteComplementaryCoursesError)
    }
    
    // 3. Exclui habilidades técnicas
    const { error: deleteTechnicalSkillsError } = await supabase
      .from("role_technical_skills")
      .delete()
      .eq("role_id", id)
    
    if (deleteTechnicalSkillsError) {
      console.error("Erro ao excluir habilidades técnicas:", deleteTechnicalSkillsError)
    }
    
    // 4. Exclui habilidades comportamentais
    const { error: deleteBehavioralSkillsError } = await supabase
      .from("role_behavioral_skills")
      .delete()
      .eq("role_id", id)
    
    if (deleteBehavioralSkillsError) {
      console.error("Erro ao excluir habilidades comportamentais:", deleteBehavioralSkillsError)
    }
    
    // 5. Exclui idiomas
    const { error: deleteLanguagesError } = await supabase
      .from("role_languages")
      .delete()
      .eq("role_id", id)
    
    if (deleteLanguagesError) {
      console.error("Erro ao excluir idiomas:", deleteLanguagesError)
    }
    
    // 6. Exclui histórico de cargos (não ativos)
    const { error: deleteRoleEmployeesError } = await supabase
      .from("employee_roles")
      .delete()
      .eq("role_id", id)
      .eq("is_current", false)
    
    if (deleteRoleEmployeesError) {
      console.error("Erro ao excluir histórico de cargos:", deleteRoleEmployeesError)
    }
    
    // Finalmente, exclui o cargo
    const { error } = await supabase
      .from("roles")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao excluir cargo:", error)
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    // Revalidar o caminho para atualizar os dados
    revalidatePath("/dashboard/roles")
    
    return constructServerResponse({
      success: true,
      message: "Cargo excluído com sucesso"
    })
  } catch (error) {
    console.error("Erro ao excluir cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir cargo"
    })
  }
}

/**
 * Server action para atribuir um cargo a um funcionário a partir de FormData
 * @param formData Dados do formulário
 * @returns Resposta com a atribuição criada ou erro
 */
export async function assignRoleToEmployeeFromForm(formData: FormData): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem atribuir cargos"
      })
    }

    // Extrair dados do formulário
    const roleId = formData.get("roleId") as string
    const employeeId = formData.get("employeeId") as string
    const startDate = formData.get("startDate") as string

    if (!roleId || !employeeId) {
      return constructServerResponse({
        success: false,
        error: "Cargo e funcionário são obrigatórios"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("company_id")
      .eq("id", employeeId)
      .single()
    
    if (employeeError || !employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    if (employee.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este funcionário não pertence à sua empresa"
      })
    }
    
    // Verifica se o cargo pertence à empresa
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
    
    if (roleError || !role) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado"
      })
    }
    
    if (role.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este cargo não pertence à sua empresa"
      })
    }

    // Verificar se o funcionário já tem um cargo atual
    const { data: currentRoleData } = await supabase
      .from("employee_roles")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("is_current", true)

    // Se o funcionário já tiver um cargo atual, finalizar esse cargo
    if (currentRoleData && currentRoleData.length > 0) {
      await supabase
        .from("employee_roles")
        .update({
          is_current: false,
          end_date: startDate || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("employee_id", employeeId)
        .eq("is_current", true)
    }

    // Atribuir o novo cargo ao funcionário
    const { data, error } = await supabase
      .from("employee_roles")
      .insert({
        role_id: roleId,
        employee_id: employeeId,
        company_id: company.id,
        start_date: startDate || new Date().toISOString(),
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao atribuir cargo:", error)
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath(`/dashboard/employees/${employeeId}`)
    revalidatePath(`/dashboard/roles/${roleId}`)

    return constructServerResponse({
      success: true,
      data,
      message: "Cargo atribuído com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atribuir cargo ao funcionário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atribuir cargo ao funcionário"
    })
  }
}

/**
 * Server action para finalizar a atribuição de um cargo a um funcionário
 * @param id ID da atribuição de cargo
 * @returns Resposta com a atribuição atualizada ou erro
 */
export async function endRoleAssignmentById(id: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem finalizar atribuições de cargos"
      })
    }
    
    const supabase = await createClient()
    
    // Busca a atribuição de cargo para verificar permissões
    const { data: roleEmployee, error: fetchError } = await supabase
      .from("employee_roles")
      .select("*, employee:employees(company_id)")
      .eq("id", id)
      .single()
    
    if (fetchError || !roleEmployee) {
      return constructServerResponse({
        success: false,
        error: "Atribuição de cargo não encontrada"
      })
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    if (roleEmployee.employee.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este funcionário não pertence à sua empresa"
      })
    }

    // Finalizar a atribuição
    const { data, error } = await supabase
      .from("employee_roles")
      .update({
        is_current: false,
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao finalizar atribuição:", error)
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath(`/dashboard/employees/${roleEmployee.employee_id}`)
    revalidatePath(`/dashboard/roles/${roleEmployee.role_id}`)
    
    return constructServerResponse({
      success: true,
      data,
      message: "Atribuição de cargo finalizada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao finalizar atribuição de cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro ao finalizar atribuição de cargo"
    })
  }
}

/**
 * Server action para obter todos os cargos com paginação e filtro
 * @param page Número da página (1-indexed)
 * @param limit Limite de itens por página
 * @param search Termo de busca
 * @returns Resposta com lista de cargos e metadados de paginação
 */
export async function getRolesWithPagination(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Calcula o offset para a paginação (1-indexed para 0-indexed)
    const offset = (page - 1) * limit
    
    // Prepara a query base
    let query = supabase
      .from("roles")
      .select(`
        *,
        team:teams(id, name),
        employee_count:employee_roles!role_id(count)
      `, { count: "exact" })
      .eq("company_id", company.id)
    
    // Adiciona filtro de busca se fornecido
    if (search && search.trim() !== "") {
      query = query.ilike("title", `%${search}%`)
    }
    
    // Adiciona paginação e ordenação
    query = query
      .order("title", { ascending: true })
      .range(offset, offset + limit - 1)
    
    const { data, count, error } = await query
    
    if (error) {
      return constructServerResponse({
        success: false,
        error: `Erro ao buscar cargos: ${error.message}`
      })
    }
    
    // Prepara os metadados de paginação
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)
    
    return constructServerResponse({
      success: true,
      data: {
        items: data,
        meta: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: `${totalItems} cargos encontrados`
    })
  } catch (error) {
    console.error("Erro ao buscar cargos:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar cargos"
    })
  }
}

/**
 * Server action para obter detalhes de um cargo por ID
 * @param id ID do cargo
 * @returns Resposta com detalhes do cargo
 */
export async function getRoleDetailsById(id: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Busca o cargo base
    const { data: role, error } = await supabase
      .from("roles")
      .select(`
        *,
        team:teams(id, name)
      `)
      .eq("id", id)
      .single()
    
    if (error) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado"
      })
    }
    
    // Verifica se o cargo pertence à empresa do usuário
    if (role.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este cargo não pertence à sua empresa"
      })
    }
    
    // Busca todas as informações relacionadas
    const [
      coursesResult,
      complementaryCoursesResult,
      technicalSkillsResult,
      behavioralSkillsResult,
      languagesResult,
      employeesCountResult
    ] = await Promise.all([
      // Cursos
      supabase
        .from("role_courses")
        .select("*")
        .eq("role_id", id),
      
      // Cursos complementares
      supabase
        .from("role_complementary_courses")
        .select("*")
        .eq("role_id", id),
      
      // Habilidades técnicas
      supabase
        .from("role_technical_skills")
        .select("*")
        .eq("role_id", id),
      
      // Habilidades comportamentais
      supabase
        .from("role_behavioral_skills")
        .select("*")
        .eq("role_id", id),
      
      // Idiomas
      supabase
        .from("role_languages")
        .select("*")
        .eq("role_id", id),
      
      // Contagem de funcionários
      supabase
        .from("employee_roles")
        .select("*", { count: "exact", head: true })
        .eq("role_id", id)
        .eq("is_current", true)
    ])
    
    // Verifica erros
    const errors = []
    
    if (coursesResult.error) errors.push(`Erro ao buscar cursos: ${coursesResult.error.message}`)
    if (complementaryCoursesResult.error) errors.push(`Erro ao buscar cursos complementares: ${complementaryCoursesResult.error.message}`)
    if (technicalSkillsResult.error) errors.push(`Erro ao buscar habilidades técnicas: ${technicalSkillsResult.error.message}`)
    if (behavioralSkillsResult.error) errors.push(`Erro ao buscar habilidades comportamentais: ${behavioralSkillsResult.error.message}`)
    if (languagesResult.error) errors.push(`Erro ao buscar idiomas: ${languagesResult.error.message}`)
    if (employeesCountResult.error) errors.push(`Erro ao contar funcionários: ${employeesCountResult.error.message}`)
    
    if (errors.length > 0) {
      return constructServerResponse({
        success: false,
        error: errors.join("; ")
      })
    }
    
    // Combina todos os dados
    const roleWithDetails = {
      ...role,
      courses: coursesResult.data || [],
      complementary_courses: complementaryCoursesResult.data || [],
      technical_skills: technicalSkillsResult.data || [],
      behavioral_skills: behavioralSkillsResult.data || [],
      languages: languagesResult.data || [],
      employees_count: employeesCountResult.count || 0
    }
    
    return constructServerResponse({
      success: true,
      data: roleWithDetails,
      message: "Detalhes do cargo obtidos com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes do cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar detalhes do cargo"
    })
  }
}

/**
 * Server action para obter o histórico de cargos de um funcionário
 * @param employeeId ID do funcionário
 * @returns Resposta com histórico de cargos
 */
export async function getEmployeeRoleHistoryById(employeeId: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("company_id")
      .eq("id", employeeId)
      .single()
    
    if (employeeError || !employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    if (employee.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este funcionário não pertence à sua empresa"
      })
    }
    
    // Busca o histórico de cargos
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        role:roles(id, title, contract_type)
      `)
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })
    
    if (error) {
      return constructServerResponse({
        success: false,
        error: `Erro ao buscar histórico de cargos: ${error.message}`
      })
    }
    
    return constructServerResponse({
      success: true,
      data,
      message: `${data.length} registros encontrados`
    })
  } catch (error) {
    console.error("Erro ao buscar histórico de cargos:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar histórico de cargos"
    })
  }
}

/**
 * Server action para obter funcionários de um cargo
 * @param roleId ID do cargo
 * @returns Resposta com lista de funcionários
 */
export async function getRoleEmployeesById(roleId: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o cargo pertence à empresa
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
    
    if (roleError || !role) {
      return constructServerResponse({
        success: false,
        error: "Cargo não encontrado"
      })
    }
    
    if (role.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Este cargo não pertence à sua empresa"
      })
    }
    
    // Busca funcionários com este cargo
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        employee:employees(id, full_name, email, status, position)
      `)
      .eq("role_id", roleId)
      .eq("is_current", true)
      .order("start_date", { ascending: false })
    
    if (error) {
      return constructServerResponse({
        success: false,
        error: `Erro ao buscar funcionários: ${error.message}`
      })
    }
    
    return constructServerResponse({
      success: true,
      data,
      message: `${data.length} funcionários encontrados`
    })
  } catch (error) {
    console.error("Erro ao buscar funcionários do cargo:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar funcionários"
    })
  }
} 