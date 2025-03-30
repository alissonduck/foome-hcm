/**
 * Serviço para gerenciamento de cargos
 * Fornece métodos para interagir com as tabelas de cargos
 */

import { createClient } from "@/lib/supabase/server"
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

export class roleService {
  /**
   * Obtém todos os cargos de uma empresa
   * @param companyId ID da empresa
   * @param includeInactive Incluir cargos inativos
   * @returns Lista de cargos
   */
  static async getRoles(companyId: string, includeInactive = false): Promise<RoleWithTeam[]> {
    let query = (await createClient())
      .from("roles")
      .select(`
        *,
        team:teams(
          id, name
        )
      `)
      .eq("company_id", companyId)
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
  }

  /**
   * Obtém um cargo específico com todos os detalhes
   * @param roleId ID do cargo
   * @returns Detalhes do cargo
   */
  static async getRoleWithDetails(roleId: string): Promise<RoleWithDetails> {
    // Busca o cargo com a equipe
    const { data: role, error: roleError } = await (await createClient())
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

    // Busca os cursos do cargo
    const { data: courses, error: coursesError } = await (await createClient())
      .from("role_courses")
      .select("*")
      .eq("role_id", roleId)

    if (coursesError) {
      console.error("Erro ao buscar cursos do cargo:", coursesError)
      throw new Error("Não foi possível buscar os cursos do cargo")
    }

    // Busca os cursos complementares do cargo
    const { data: complementaryCourses, error: complementaryCoursesError } = await (await createClient())
      .from("role_complementary_courses")
      .select("*")
      .eq("role_id", roleId)

    if (complementaryCoursesError) {
      console.error("Erro ao buscar cursos complementares do cargo:", complementaryCoursesError)
      throw new Error("Não foi possível buscar os cursos complementares do cargo")
    }

    // Busca as habilidades técnicas do cargo
    const { data: technicalSkills, error: technicalSkillsError } = await (await createClient())
      .from("role_technical_skills")
      .select("*")
      .eq("role_id", roleId)

    if (technicalSkillsError) {
      console.error("Erro ao buscar habilidades técnicas do cargo:", technicalSkillsError)
      throw new Error("Não foi possível buscar as habilidades técnicas do cargo")
    }

    // Busca as habilidades comportamentais do cargo
    const { data: behavioralSkills, error: behavioralSkillsError } = await (await createClient())
      .from("role_behavioral_skills")
      .select("*")
      .eq("role_id", roleId)

    if (behavioralSkillsError) {
      console.error("Erro ao buscar habilidades comportamentais do cargo:", behavioralSkillsError)
      throw new Error("Não foi possível buscar as habilidades comportamentais do cargo")
    }

    // Busca os idiomas do cargo
    const { data: languages, error: languagesError } = await (await createClient())
      .from("role_languages")
      .select("*")
      .eq("role_id", roleId)

    if (languagesError) {
      console.error("Erro ao buscar idiomas do cargo:", languagesError)
      throw new Error("Não foi possível buscar os idiomas do cargo")
    }

    // Conta quantos funcionários estão atualmente neste cargo
    const { count, error: countError } = await (await createClient())
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
  }

  /**
   * Obtém o histórico de cargos de um funcionário
   * @param employeeId ID do funcionário
   * @returns Histórico de cargos
   */
  static async getEmployeeRoleHistory(employeeId: string): Promise<RoleEmployeeWithDetails[]> {
    const { data, error } = await (await createClient())
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
  }

  /**
   * Obtém os funcionários atuais de um cargo
   * @param roleId ID do cargo
   * @returns Lista de funcionários
   */
  static async getRoleEmployees(roleId: string): Promise<RoleEmployeeWithDetails[]> {
    const { data, error } = await (await createClient())
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
  }

  /**
   * Cria um novo cargo com todos os detalhes
   * @param roleForm Dados do formulário de cargo
   * @returns Cargo criado
   */
  static async createRole(roleForm: RoleFormValues): Promise<Role> {
    // Inicia uma transação
    const { data: role, error: roleError } = await (await createClient())
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

    // Adiciona os cursos
    if (roleForm.courses.length > 0) {
      const coursesData = roleForm.courses.map((course) => ({
        role_id: role.id,
        name: course.name,
        is_required: course.is_required,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: coursesError } = await (await createClient()).from("role_courses").insert(coursesData)

      if (coursesError) {
        console.error("Erro ao adicionar cursos:", coursesError)
        throw new Error("Não foi possível adicionar os cursos")
      }
    }

    // Adiciona os cursos complementares
    if (roleForm.complementary_courses.length > 0) {
      const complementaryCoursesData = roleForm.complementary_courses.map((course) => ({
        role_id: role.id,
        name: course.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: complementaryCoursesError } = await (await createClient())
        .from("role_complementary_courses")
        .insert(complementaryCoursesData)

      if (complementaryCoursesError) {
        console.error("Erro ao adicionar cursos complementares:", complementaryCoursesError)
        throw new Error("Não foi possível adicionar os cursos complementares")
      }
    }

    // Adiciona as habilidades técnicas
    if (roleForm.technical_skills.length > 0) {
      const technicalSkillsData = roleForm.technical_skills.map((skill) => ({
        role_id: role.id,
        name: skill.name,
        level: skill.level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: technicalSkillsError } = await (await createClient())
        .from("role_technical_skills")
        .insert(technicalSkillsData)

      if (technicalSkillsError) {
        console.error("Erro ao adicionar habilidades técnicas:", technicalSkillsError)
        throw new Error("Não foi possível adicionar as habilidades técnicas")
      }
    }

    // Adiciona as habilidades comportamentais
    if (roleForm.behavioral_skills.length > 0) {
      const behavioralSkillsData = roleForm.behavioral_skills.map((skill) => ({
        role_id: role.id,
        name: skill.name,
        level: skill.level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: behavioralSkillsError } = await (await createClient())
        .from("role_behavioral_skills")
        .insert(behavioralSkillsData)

      if (behavioralSkillsError) {
        console.error("Erro ao adicionar habilidades comportamentais:", behavioralSkillsError)
        throw new Error("Não foi possível adicionar as habilidades comportamentais")
      }
    }

    // Adiciona os idiomas
    if (roleForm.languages.length > 0) {
      const languagesData = roleForm.languages.map((language) => ({
        role_id: role.id,
        name: language.name,
        level: language.level,
        is_required: language.is_required,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: languagesError } = await (await createClient()).from("role_languages").insert(languagesData)

      if (languagesError) {
        console.error("Erro ao adicionar idiomas:", languagesError)
        throw new Error("Não foi possível adicionar os idiomas")
      }
    }

    return role
  }

  /**
   * Atualiza um cargo existente com todos os detalhes
   * @param roleId ID do cargo
   * @param roleForm Dados do formulário de cargo
   * @returns Cargo atualizado
   */
  static async updateRole(roleId: string, roleForm: RoleFormValues): Promise<Role> {
    // Atualiza o cargo principal
    const { data: role, error: roleError } = await (await createClient())
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

    // Remove todos os cursos existentes
    const { error: deleteCoursesError } = await (await createClient()).from("role_courses").delete().eq("role_id", roleId)

    if (deleteCoursesError) {
      console.error("Erro ao remover cursos existentes:", deleteCoursesError)
      throw new Error("Não foi possível remover os cursos existentes")
    }

    // Adiciona os novos cursos
    if (roleForm.courses.length > 0) {
      const coursesData = roleForm.courses.map((course) => ({
        role_id: roleId,
        name: course.name,
        is_required: course.is_required,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: coursesError } = await (await createClient()).from("role_courses").insert(coursesData)

      if (coursesError) {
        console.error("Erro ao adicionar cursos:", coursesError)
        throw new Error("Não foi possível adicionar os cursos")
      }
    }

    // Remove todos os cursos complementares existentes
    const { error: deleteComplementaryCoursesError } = await (await createClient())
      .from("role_complementary_courses")
      .delete()
      .eq("role_id", roleId)

    if (deleteComplementaryCoursesError) {
      console.error("Erro ao remover cursos complementares existentes:", deleteComplementaryCoursesError)
      throw new Error("Não foi possível remover os cursos complementares existentes")
    }

    // Adiciona os novos cursos complementares
    if (roleForm.complementary_courses.length > 0) {
      const complementaryCoursesData = roleForm.complementary_courses.map((course) => ({
        role_id: roleId,
        name: course.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: complementaryCoursesError } = await (await createClient())
        .from("role_complementary_courses")
        .insert(complementaryCoursesData)

      if (complementaryCoursesError) {
        console.error("Erro ao adicionar cursos complementares:", complementaryCoursesError)
        throw new Error("Não foi possível adicionar os cursos complementares")
      }
    }

    // Remove todas as habilidades técnicas existentes
    const { error: deleteTechnicalSkillsError } = await (await createClient())
      .from("role_technical_skills")
      .delete()
      .eq("role_id", roleId)

    if (deleteTechnicalSkillsError) {
      console.error("Erro ao remover habilidades técnicas existentes:", deleteTechnicalSkillsError)
      throw new Error("Não foi possível remover as habilidades técnicas existentes")
    }

    // Adiciona as novas habilidades técnicas
    if (roleForm.technical_skills.length > 0) {
      const technicalSkillsData = roleForm.technical_skills.map((skill) => ({
        role_id: roleId,
        name: skill.name,
        level: skill.level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: technicalSkillsError } = await (await createClient())
        .from("role_technical_skills")
        .insert(technicalSkillsData)

      if (technicalSkillsError) {
        console.error("Erro ao adicionar habilidades técnicas:", technicalSkillsError)
        throw new Error("Não foi possível adicionar as habilidades técnicas")
      }
    }

    // Remove todas as habilidades comportamentais existentes
    const { error: deleteBehavioralSkillsError } = await (await createClient())
      .from("role_behavioral_skills")
      .delete()
      .eq("role_id", roleId)

    if (deleteBehavioralSkillsError) {
      console.error("Erro ao remover habilidades comportamentais existentes:", deleteBehavioralSkillsError)
      throw new Error("Não foi possível remover as habilidades comportamentais existentes")
    }

    // Adiciona as novas habilidades comportamentais
    if (roleForm.behavioral_skills.length > 0) {
      const behavioralSkillsData = roleForm.behavioral_skills.map((skill) => ({
        role_id: roleId,
        name: skill.name,
        level: skill.level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: behavioralSkillsError } = await (await createClient())
        .from("role_behavioral_skills")
        .insert(behavioralSkillsData)

      if (behavioralSkillsError) {
        console.error("Erro ao adicionar habilidades comportamentais:", behavioralSkillsError)
        throw new Error("Não foi possível adicionar as habilidades comportamentais")
      }
    }

    // Remove todos os idiomas existentes
    const { error: deleteLanguagesError } = await (await createClient()).from("role_languages").delete().eq("role_id", roleId)

    if (deleteLanguagesError) {
      console.error("Erro ao remover idiomas existentes:", deleteLanguagesError)
      throw new Error("Não foi possível remover os idiomas existentes")
    }

    // Adiciona os novos idiomas
    if (roleForm.languages.length > 0) {
      const languagesData = roleForm.languages.map((language) => ({
        role_id: roleId,
        name: language.name,
        level: language.level,
        is_required: language.is_required,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: languagesError } = await (await createClient()).from("role_languages").insert(languagesData)

      if (languagesError) {
        console.error("Erro ao adicionar idiomas:", languagesError)
        throw new Error("Não foi possível adicionar os idiomas")
      }
    }

    return role
  }

  /**
   * Ativa ou desativa um cargo
   * @param roleId ID do cargo
   * @param active Status de ativação
   * @returns Verdadeiro se a operação for bem-sucedida
   */
  static async toggleRoleActive(roleId: string, active: boolean): Promise<boolean> {
    const { error } = await (await createClient())
      .from("roles")
      .update({
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roleId)

    if (error) {
      console.error("Erro ao atualizar status do cargo:", error)
      throw new Error(`Não foi possível ${active ? "ativar" : "desativar"} o cargo`)
    }

    return true
  }

  /**
   * Exclui um cargo
   * @param roleId ID do cargo
   * @returns Verdadeiro se a exclusão for bem-sucedida
   */
  static async deleteRole(roleId: string): Promise<boolean> {
    // Verifica se há funcionários atualmente neste cargo
    const { count, error: countError } = await (await createClient())
      .from("role_employees")
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
      "role_employees",
    ]

    for (const table of tables) {
      const { error } = await (await createClient()).from(table).delete().eq("role_id", roleId)

      if (error) {
        console.error(`Erro ao remover registros da tabela ${table}:`, error)
        throw new Error("Não foi possível remover os registros relacionados ao cargo")
      }
    }

    // Remove o cargo
    const { error } = await (await createClient()).from("roles").delete().eq("id", roleId)

    if (error) {
      console.error("Erro ao excluir cargo:", error)
      throw new Error("Não foi possível excluir o cargo")
    }

    return true
  }

  /**
   * Atribui um cargo a um funcionário
   * @param roleEmployee Dados da atribuição
   * @returns Verdadeiro se a atribuição for bem-sucedida
   */
  static async assignRoleToEmployee(roleEmployee: RoleEmployeeInsert): Promise<boolean> {
    // Se for o cargo atual, desativa todos os outros cargos atuais do funcionário
    if (roleEmployee.is_current) {
      const { error: updateError } = await (await createClient())
        .from("role_employees")
        .update({
          is_current: false,
          end_date: roleEmployee.start_date,
          updated_at: new Date().toISOString(),
        })
        .eq("employee_id", roleEmployee.employee_id)
        .eq("is_current", true)

      if (updateError) {
        console.error("Erro ao atualizar cargos atuais do funcionário:", updateError)
        throw new Error("Não foi possível atualizar os cargos atuais do funcionário")
      }
    }

    // Adiciona o novo cargo ao funcionário
    const { error } = await (await createClient())
      .from("role_employees")
      .insert({
        ...roleEmployee,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error("Erro ao atribuir cargo ao funcionário:", error)
      throw new Error("Não foi possível atribuir o cargo ao funcionário")
    }

    return true
  }

  /**
   * Finaliza a atribuição de um cargo a um funcionário
   * @param roleEmployeeId ID da atribuição
   * @param endDate Data de término
   * @returns Verdadeiro se a operação for bem-sucedida
   */
  static async endRoleAssignment(roleEmployeeId: string, endDate: string): Promise<boolean> {
    const { error } = await (await createClient())
      .from("role_employees")
      .update({
        is_current: false,
        end_date: endDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roleEmployeeId)

    if (error) {
      console.error("Erro ao finalizar atribuição de cargo:", error)
      throw new Error("Não foi possível finalizar a atribuição de cargo")
    }

    return true
  }
}

