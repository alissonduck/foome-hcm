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
      .from("role_employees")
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
      throw new Error("Funcionário não encontrado")
    }
    
    if (employee.company_id !== company.id && !company.isAdmin) {
      throw new Error("Você não tem permissão para acessar este funcionário")
    }
    
    const { data, error } = await supabase
      .from("role_employees")
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
    
    // Verifica se o cargo pertence à empresa
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleId)
      .single()
      
    if (roleError || !role) {
      throw new Error("Cargo não encontrado")
    }
    
    if (role.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }
    
    const { data, error } = await supabase
      .from("role_employees")
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
 * @returns Status da operação
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
    
    // Verifica se existem funcionários associados ao cargo
    const { count, error: countError } = await supabase
      .from("role_employees")
      .select("*", { count: "exact", head: true })
      .eq("role_id", roleId)
      .eq("is_current", true)
    
    if (countError) {
      throw countError
    }
    
    if (count && count > 0) {
      throw new Error("Não é possível excluir um cargo que possui funcionários associados")
    }
    
    // Exclui os registros relacionados (usando uma transação manual)
    
    // 1. Exclui cursos
    const { error: deleteCoursesError } = await supabase
      .from("role_courses")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteCoursesError) {
      throw deleteCoursesError
    }
    
    // 2. Exclui cursos complementares
    const { error: deleteComplementaryCoursesError } = await supabase
      .from("role_complementary_courses")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteComplementaryCoursesError) {
      throw deleteComplementaryCoursesError
    }
    
    // 3. Exclui habilidades técnicas
    const { error: deleteTechnicalSkillsError } = await supabase
      .from("role_technical_skills")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteTechnicalSkillsError) {
      throw deleteTechnicalSkillsError
    }
    
    // 4. Exclui habilidades comportamentais
    const { error: deleteBehavioralSkillsError } = await supabase
      .from("role_behavioral_skills")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteBehavioralSkillsError) {
      throw deleteBehavioralSkillsError
    }
    
    // 5. Exclui idiomas
    const { error: deleteLanguagesError } = await supabase
      .from("role_languages")
      .delete()
      .eq("role_id", roleId)
    
    if (deleteLanguagesError) {
      throw deleteLanguagesError
    }
    
    // 6. Exclui histórico de cargos (não ativos)
    const { error: deleteRoleEmployeesError } = await supabase
      .from("role_employees")
      .delete()
      .eq("role_id", roleId)
      .eq("is_current", false)
    
    if (deleteRoleEmployeesError) {
      throw deleteRoleEmployeesError
    }
    
    // 7. Finalmente, exclui o cargo
    const { error: deleteRoleError } = await supabase
      .from("roles")
      .delete()
      .eq("id", roleId)
    
    if (deleteRoleError) {
      throw deleteRoleError
    }
    
    // Revalida a página de cargos
    revalidatePath("/dashboard/roles")
    
    return true
  } catch (error) {
    console.error("Erro ao excluir cargo:", error)
    throw new Error(`Não foi possível excluir o cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Atribui um cargo a um funcionário
 * @param roleEmployee Dados da atribuição de cargo
 * @returns Status da operação
 */
export async function assignRoleToEmployee(roleEmployee: RoleEmployeeInsert): Promise<boolean> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atribuir cargos")
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("company_id")
      .eq("id", roleEmployee.employee_id)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    if (employee.company_id !== company.id) {
      throw new Error("Este funcionário não pertence à sua empresa")
    }
    
    // Verifica se o cargo pertence à empresa
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("company_id")
      .eq("id", roleEmployee.role_id)
      .single()
    
    if (roleError || !role) {
      throw new Error("Cargo não encontrado")
    }
    
    if (role.company_id !== company.id) {
      throw new Error("Este cargo não pertence à sua empresa")
    }
    
    // Se a atribuição for atual, desativa todas as atribuições atuais
    if (roleEmployee.is_current) {
      const { error: updateError } = await supabase
        .from("role_employees")
        .update({
          is_current: false,
          end_date: roleEmployee.start_date,
        })
        .eq("employee_id", roleEmployee.employee_id)
        .eq("is_current", true)
      
      if (updateError) {
        throw updateError
      }
    }
    
    // Insere a nova atribuição
    const { error: insertError } = await supabase
      .from("role_employees")
      .insert({
        ...roleEmployee,
        company_id: company.id,
      })
    
    if (insertError) {
      throw insertError
    }
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${roleEmployee.employee_id}`)
    revalidatePath(`/dashboard/roles/${roleEmployee.role_id}`)
    
    return true
  } catch (error) {
    console.error("Erro ao atribuir cargo:", error)
    throw new Error(`Não foi possível atribuir o cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Encerra a atribuição de um cargo a um funcionário
 * @param roleEmployeeId ID da atribuição de cargo
 * @param endDate Data de término
 * @returns Status da operação
 */
export async function endRoleAssignment(roleEmployeeId: string, endDate: string): Promise<boolean> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem encerrar atribuições de cargos")
    }
    
    const supabase = await createClient()
    
    // Busca a atribuição de cargo para verificar permissões
    const { data: roleEmployee, error: fetchError } = await supabase
      .from("role_employees")
      .select("*, employee:employees(company_id)")
      .eq("id", roleEmployeeId)
      .single()
    
    if (fetchError || !roleEmployee) {
      throw new Error("Atribuição de cargo não encontrada")
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    if (roleEmployee.employee.company_id !== company.id) {
      throw new Error("Este funcionário não pertence à sua empresa")
    }
    
    // Atualiza a atribuição de cargo
    const { error } = await supabase
      .from("role_employees")
      .update({
        is_current: false,
        end_date: endDate,
      })
      .eq("id", roleEmployeeId)
    
    if (error) {
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath(`/dashboard/employees/${roleEmployee.employee_id}`)
    revalidatePath(`/dashboard/roles/${roleEmployee.role_id}`)
    
    return true
  } catch (error) {
    console.error("Erro ao encerrar atribuição de cargo:", error)
    throw new Error(`Não foi possível encerrar a atribuição de cargo: ${error instanceof Error ? error.message : String(error)}`)
  }
} 