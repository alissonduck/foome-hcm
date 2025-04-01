/**
 * Serviço para gerenciamento de funcionários
 * Fornece métodos para interagir com funcionários
 */

import { createClient } from "@/lib/supabase/server"
import { EmployeeFilters, EmployeeWithCompany, EmployeeWithRole, EmployeeInsert, EmployeeUpdate } from "@/lib/types/employees"

export class employeeService {
  /**
   * Obtém todos os funcionários de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de funcionários
   */
  static async getEmployees(companyId: string): Promise<EmployeeWithCompany[]> {
    try {
      if (!companyId) {
        console.warn("ID da empresa não fornecido")
        return []
      }

      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          company:company_id (
            id,
            name,
            cnpj
          )
        `)
        .eq("company_id", companyId)
        .order("full_name", { ascending: true })
      
      if (error) {
        console.error("Erro na consulta:", error)
        throw error
      }
      
      return data as unknown as EmployeeWithCompany[]
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error)
      throw new Error(`Não foi possível buscar os funcionários: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Obtém um funcionário específico
   * @param employeeId ID do funcionário
   * @returns Funcionário
   */
  static async getEmployee(employeeId: string): Promise<EmployeeWithRole> {
    try {
      if (!employeeId) {
        throw new Error("ID do funcionário não fornecido")
      }

      const supabase = await createClient()
      
      // Busca o funcionário com informações da empresa
      const { data: employee, error } = await supabase
        .from("employees")
        .select(`
          *,
          company:company_id (
            id,
            name,
            cnpj
          )
        `)
        .eq("id", employeeId)
        .single()
      
      if (error) {
        console.error("Erro na consulta:", error)
        throw error
      }
      
      // Busca os cargos associados ao funcionário
      const { data: roles, error: rolesError } = await supabase
        .from("employee_roles")
        .select(`
          *,
          role:role_id (
            id,
            title,
            level
          )
        `)
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false })
      
      if (rolesError) {
        console.error("Erro ao buscar cargos:", rolesError)
      }
      
      // Transforma os dados para o formato esperado
      const employeeWithRoles: EmployeeWithRole = {
        ...employee,
        roles: roles?.map(r => r.role) || [],
        current_role: roles?.find(r => r.is_current)?.role || null
      } as unknown as EmployeeWithRole
      
      return employeeWithRoles
    } catch (error) {
      console.error("Erro ao buscar funcionário:", error)
      throw new Error(`Não foi possível buscar o funcionário: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Cria um novo funcionário
   * @param employee Dados do funcionário
   * @returns Funcionário criado
   */
  static async createEmployee(employee: EmployeeInsert): Promise<EmployeeWithCompany> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select(`
          *,
          company:company_id (
            id,
            name,
            cnpj
          )
        `)
        .single()
      
      if (error) {
        console.error("Erro ao criar funcionário:", error)
        throw error
      }
      
      return data as unknown as EmployeeWithCompany
    } catch (error) {
      console.error("Erro ao criar funcionário:", error)
      throw new Error(`Não foi possível criar o funcionário: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Atualiza um funcionário existente
   * @param id ID do funcionário
   * @param employee Dados atualizados do funcionário
   * @returns Funcionário atualizado
   */
  static async updateEmployee(id: string, employee: EmployeeUpdate): Promise<EmployeeWithCompany> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select(`
          *,
          company:company_id (
            id,
            name,
            cnpj
          )
        `)
        .single()
      
      if (error) {
        console.error("Erro ao atualizar funcionário:", error)
        throw error
      }
      
      return data as unknown as EmployeeWithCompany
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error)
      throw new Error(`Não foi possível atualizar o funcionário: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Remove um funcionário
   * @param id ID do funcionário
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async deleteEmployee(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      // Verifica se o funcionário existe
      const { data: employee, error: checkError } = await supabase
        .from("employees")
        .select("id")
        .eq("id", id)
        .single()
      
      if (checkError) {
        throw checkError
      }
      
      if (!employee) {
        throw new Error("Funcionário não encontrado")
      }
      
      // Exclui o funcionário
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id)
      
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error)
      throw new Error(`Não foi possível excluir o funcionário: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Atualiza o status de um funcionário
   * @param id ID do funcionário
   * @param status Novo status
   * @returns Funcionário atualizado
   */
  static async updateEmployeeStatus(id: string, status: string): Promise<EmployeeWithCompany> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employees")
        .update({ status })
        .eq("id", id)
        .select(`
          *,
          company:company_id (
            id,
            name,
            cnpj
          )
        `)
        .single()
      
      if (error) {
        console.error("Erro ao atualizar status do funcionário:", error)
        throw error
      }
      
      return data as unknown as EmployeeWithCompany
    } catch (error) {
      console.error("Erro ao atualizar status do funcionário:", error)
      throw new Error(`Não foi possível atualizar o status do funcionário: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Filtra funcionários com base em critérios
   * @param employees Lista de funcionários
   * @param filters Filtros a serem aplicados
   * @returns Lista filtrada de funcionários
   */
  static filterEmployees(employees: EmployeeWithCompany[], filters: EmployeeFilters): EmployeeWithCompany[] {
    return employees.filter(emp => {
      // Filtro por status
      if (filters.status && filters.status !== "all" && emp.status !== filters.status) {
        return false
      }
      
      // Filtro por departamento
      if (filters.department && filters.department !== "all" && emp.department !== filters.department) {
        return false
      }
      
      // Filtro por busca (nome, email, cargo)
      if (filters.search) {
        const query = filters.search.toLowerCase()
        return (
          emp.full_name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          (emp.position && emp.position.toLowerCase().includes(query))
        )
      }
      
      return true
    })
  }
  
  /**
   * Obtém todos os departamentos de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de departamentos
   */
  static async getDepartments(companyId: string): Promise<string[]> {
    try {
      if (!companyId) {
        return []
      }
      
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employees")
        .select("department")
        .eq("company_id", companyId)
        .not("department", "is", null)
      
      if (error) {
        throw error
      }
      
      // Extrai departamentos únicos
      const departments = [...new Set(data.map(e => e.department).filter(Boolean))]
      
      return departments
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error)
      throw new Error("Não foi possível buscar os departamentos")
    }
  }
}