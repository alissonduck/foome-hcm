/**
 * Serviço para gerenciamento de cargos
 * Fornece métodos para interagir com cargos
 */
import { createClient } from "@/lib/supabase/server"
import { Role, RoleBehavioralSkill, RoleComplementaryCourse, RoleCourse, RoleEmployeeWithDetails, RoleInsert, RoleLanguage, RoleTechnicalSkill, RoleUpdate, RoleWithDetails, RoleWithTeam } from "@/lib/types/roles"

export class roleService {
  /**
   * Obtém todos os cargos de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de cargos
   */
  static async getRoles(companyId: string): Promise<RoleWithTeam[]> {
    try {
      if (!companyId) {
        console.warn("ID da empresa não fornecido")
        return []
      }

      const supabase = await createClient()
      
      const { data, error } = await supabase
      .from("roles")
      .select(`
        *,
          team:team_id(
            id,
            name
        )
      `)
      .eq("company_id", companyId)
        .order("title", { ascending: true })

      if (error) {
        console.error("Erro na consulta:", error)
        throw error
    }

      return data as unknown as RoleWithTeam[]
    } catch (error) {
      console.error("Erro ao buscar cargos:", error)
      throw new Error(`Não foi possível buscar os cargos: ${JSON.stringify(error)}`)
    }
  }

  /**
   * Obtém um cargo específico com detalhes
   * @param roleId ID do cargo
   * @returns Detalhes do cargo
   */
  static async getRoleDetails(roleId: string): Promise<RoleWithDetails> {
    try {
      if (!roleId) {
        throw new Error("ID do cargo não fornecido")
      }

      const supabase = await createClient()
      
      // Busca informações básicas do cargo
      const { data: role, error } = await supabase
      .from("roles")
      .select(`
        *,
          team:team_id(
            id,
            name
        )
      `)
      .eq("id", roleId)
      .single()

      if (error) {
        console.error("Erro na consulta:", error)
        throw error
    }

    // Busca os cursos do cargo
      const { data: courses, error: coursesError } = await supabase
      .from("role_courses")
      .select("*")
      .eq("role_id", roleId)

    if (coursesError) {
        console.error("Erro ao buscar cursos:", coursesError)
    }

    // Busca os cursos complementares do cargo
      const { data: complementaryCourses, error: complementaryCoursesError } = await supabase
      .from("role_complementary_courses")
      .select("*")
      .eq("role_id", roleId)

    if (complementaryCoursesError) {
        console.error("Erro ao buscar cursos complementares:", complementaryCoursesError)
    }

    // Busca as habilidades técnicas do cargo
      const { data: technicalSkills, error: technicalSkillsError } = await supabase
      .from("role_technical_skills")
      .select("*")
      .eq("role_id", roleId)

    if (technicalSkillsError) {
        console.error("Erro ao buscar habilidades técnicas:", technicalSkillsError)
    }

    // Busca as habilidades comportamentais do cargo
      const { data: behavioralSkills, error: behavioralSkillsError } = await supabase
      .from("role_behavioral_skills")
      .select("*")
      .eq("role_id", roleId)

    if (behavioralSkillsError) {
        console.error("Erro ao buscar habilidades comportamentais:", behavioralSkillsError)
    }

    // Busca os idiomas do cargo
      const { data: languages, error: languagesError } = await supabase
      .from("role_languages")
      .select("*")
      .eq("role_id", roleId)

    if (languagesError) {
        console.error("Erro ao buscar idiomas:", languagesError)
    }

      // Conta funcionários atuais neste cargo
      const { count, error: countError } = await supabase
        .from("employee_roles")
      .select("*", { count: "exact", head: true })
      .eq("role_id", roleId)
      .eq("is_current", true)

    if (countError) {
        console.error("Erro ao contar funcionários:", countError)
      }
      
      // Combina todas as informações
      const roleWithDetails: RoleWithDetails = {
        ...role,
        courses: courses || [],
        complementary_courses: complementaryCourses || [],
        technical_skills: technicalSkills || [],
        behavioral_skills: behavioralSkills || [],
        languages: languages || [],
        employees_count: count || 0
      }
      
      return roleWithDetails
    } catch (error) {
      console.error("Erro ao buscar detalhes do cargo:", error)
      throw new Error(`Não foi possível buscar os detalhes do cargo: ${JSON.stringify(error)}`)
    }
  }

  /**
   * Obtém o histórico de cargos de um funcionário
   * @param employeeId ID do funcionário
   * @returns Histórico de cargos
   */
  static async getEmployeeRoleHistory(employeeId: string): Promise<RoleEmployeeWithDetails[]> {
    const { data, error } = await (await createClient())
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
  }

  /**
   * Obtém os funcionários atuais de um cargo
   * @param roleId ID do cargo
   * @returns Lista de funcionários
   */
  static async getRoleEmployees(roleId: string): Promise<RoleEmployeeWithDetails[]> {
    const { data, error } = await (await createClient())
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
  }

  /**
   * Cria um novo cargo
   * @param role Dados do cargo
   * @returns Cargo criado
   */
  static async createRole(role: RoleInsert): Promise<Role> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
      .from("roles")
        .insert([role])
      .select()
      .single()

      if (error) {
        console.error("Erro ao criar cargo:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao criar cargo:", error)
      throw new Error(`Não foi possível criar o cargo: ${JSON.stringify(error)}`)
      }
    }

  /**
   * Atualiza um cargo existente
   * @param id ID do cargo
   * @param role Dados atualizados do cargo
   * @returns Cargo atualizado
   */
  static async updateRole(id: string, role: RoleUpdate): Promise<Role> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("roles")
        .update(role)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Erro ao atualizar cargo:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error)
      throw new Error(`Não foi possível atualizar o cargo: ${JSON.stringify(error)}`)
      }
    }

  /**
   * Remove um cargo
   * @param id ID do cargo
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async deleteRole(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      // Verifica se existem funcionários com este cargo
      const { count, error: countError } = await supabase
        .from("employee_roles")
        .select("*", { count: "exact", head: true })
        .eq("role_id", id)

      if (countError) {
        throw countError
      }
      
      if ((count ?? 0) > 0) {
        throw new Error("Não é possível excluir um cargo que possui funcionários associados")
    }

      // Exclui o cargo
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", id)
      
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir cargo:", error)
      throw new Error(`Não foi possível excluir o cargo: ${JSON.stringify(error)}`)
    }
  }

  /**
   * Adiciona um curso ao cargo
   * @param course Dados do curso
   * @returns Curso adicionado
   */
  static async addRoleCourse(course: RoleCourse): Promise<RoleCourse> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("role_courses")
        .insert([course])
      .select()
      .single()

      if (error) {
        console.error("Erro ao adicionar curso:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao adicionar curso:", error)
      throw new Error(`Não foi possível adicionar o curso: ${JSON.stringify(error)}`)
    }
    }

  /**
   * Remove um curso do cargo
   * @param id ID do curso
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeRoleCourse(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("role_courses")
      .delete()
        .eq("id", id)

      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao remover curso:", error)
      throw new Error(`Não foi possível remover o curso: ${JSON.stringify(error)}`)
    }
    }

  /**
   * Adiciona um curso complementar ao cargo
   * @param course Dados do curso complementar
   * @returns Curso complementar adicionado
   */
  static async addRoleComplementaryCourse(course: RoleComplementaryCourse): Promise<RoleComplementaryCourse> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("role_complementary_courses")
        .insert([course])
        .select()
        .single()

      if (error) {
        console.error("Erro ao adicionar curso complementar:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao adicionar curso complementar:", error)
      throw new Error(`Não foi possível adicionar o curso complementar: ${JSON.stringify(error)}`)
    }
    }

  /**
   * Remove um curso complementar do cargo
   * @param id ID do curso complementar
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeRoleComplementaryCourse(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("role_complementary_courses")
      .delete()
        .eq("id", id)

      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao remover curso complementar:", error)
      throw new Error(`Não foi possível remover o curso complementar: ${JSON.stringify(error)}`)
    }
    }

  /**
   * Adiciona uma habilidade técnica ao cargo
   * @param skill Dados da habilidade técnica
   * @returns Habilidade técnica adicionada
   */
  static async addRoleTechnicalSkill(skill: RoleTechnicalSkill): Promise<RoleTechnicalSkill> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("role_technical_skills")
        .insert([skill])
        .select()
        .single()

      if (error) {
        console.error("Erro ao adicionar habilidade técnica:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao adicionar habilidade técnica:", error)
      throw new Error(`Não foi possível adicionar a habilidade técnica: ${JSON.stringify(error)}`)
      }
  }

  /**
   * Remove uma habilidade técnica do cargo
   * @param id ID da habilidade técnica
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeRoleTechnicalSkill(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("role_technical_skills")
        .delete()
        .eq("id", id)

    if (error) {
        throw error
    }

    return true
    } catch (error) {
      console.error("Erro ao remover habilidade técnica:", error)
      throw new Error(`Não foi possível remover a habilidade técnica: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Adiciona uma habilidade comportamental ao cargo
   * @param skill Dados da habilidade comportamental
   * @returns Habilidade comportamental adicionada
   */
  static async addRoleBehavioralSkill(skill: RoleBehavioralSkill): Promise<RoleBehavioralSkill> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("role_behavioral_skills")
        .insert([skill])
        .select()
        .single()

      if (error) {
        console.error("Erro ao adicionar habilidade comportamental:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao adicionar habilidade comportamental:", error)
      throw new Error(`Não foi possível adicionar a habilidade comportamental: ${JSON.stringify(error)}`)
      }
    }

  /**
   * Remove uma habilidade comportamental do cargo
   * @param id ID da habilidade comportamental
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeRoleBehavioralSkill(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("role_behavioral_skills")
        .delete()
        .eq("id", id)

    if (error) {
        throw error
    }

    return true
    } catch (error) {
      console.error("Erro ao remover habilidade comportamental:", error)
      throw new Error(`Não foi possível remover a habilidade comportamental: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Adiciona um idioma ao cargo
   * @param language Dados do idioma
   * @returns Idioma adicionado
   */
  static async addRoleLanguage(language: RoleLanguage): Promise<RoleLanguage> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("role_languages")
        .insert([language])
        .select()
        .single()

      if (error) {
        console.error("Erro ao adicionar idioma:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao adicionar idioma:", error)
      throw new Error(`Não foi possível adicionar o idioma: ${JSON.stringify(error)}`)
    }
  }

  /**
   * Remove um idioma do cargo
   * @param id ID do idioma
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async removeRoleLanguage(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("role_languages")
        .delete()
        .eq("id", id)

    if (error) {
        throw error
    }

    return true
    } catch (error) {
      console.error("Erro ao remover idioma:", error)
      throw new Error(`Não foi possível remover o idioma: ${JSON.stringify(error)}`)
    }
  }
}

