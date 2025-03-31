/**
 * Serviço para gerenciar dependentes
 * Fornece funções para listar, criar, atualizar e excluir dependentes de funcionários
 */
import { createClient } from "@/lib/supabase/client"
import { 
  EmployeeDependent, 
  EmployeeDependentInsert, 
  EmployeeDependentUpdate 
} from "@/lib/types/documents"

/**
 * Classe para gerenciar dependentes de funcionários
 */
class DependentService {
  /**
   * Obtém todos os dependentes de um funcionário
   * @param employeeId ID do funcionário
   * @returns Lista de dependentes
   */
  async getDependents(employeeId: string): Promise<EmployeeDependent[]> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("employee_dependents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("full_name")
      
      if (error) {
        console.error("Erro ao buscar dependentes:", error)
        throw error
      }
      
      return data as EmployeeDependent[]
    } catch (error) {
      console.error("Erro ao buscar dependentes:", error)
      throw new Error("Não foi possível buscar os dependentes do funcionário")
    }
  }

  /**
   * Obtém um dependente específico
   * @param dependentId ID do dependente
   * @returns Dados do dependente
   */
  async getDependent(dependentId: string): Promise<EmployeeDependent> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("employee_dependents")
        .select("*")
        .eq("id", dependentId)
        .single()
      
      if (error) {
        console.error("Erro ao buscar dependente:", error)
        throw error
      }
      
      return data as EmployeeDependent
    } catch (error) {
      console.error("Erro ao buscar dependente:", error)
      throw new Error("Não foi possível buscar os dados do dependente")
    }
  }

  /**
   * Cria um novo dependente
   * @param dependent Dados do dependente
   * @returns Dependente criado
   */
  async createDependent(dependent: EmployeeDependentInsert): Promise<EmployeeDependent> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("employee_dependents")
        .insert(dependent)
        .select()
        .single()
      
      if (error) {
        console.error("Erro ao criar dependente:", error)
        throw error
      }
      
      return data as EmployeeDependent
    } catch (error) {
      console.error("Erro ao criar dependente:", error)
      throw new Error("Não foi possível criar o dependente")
    }
  }

  /**
   * Cria múltiplos dependentes de uma vez
   * @param dependents Lista de dependentes
   * @returns Dependentes criados
   */
  async createDependentsBatch(dependents: EmployeeDependentInsert[]): Promise<EmployeeDependent[]> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("employee_dependents")
        .insert(dependents)
        .select()
      
      if (error) {
        console.error("Erro ao criar dependentes:", error)
        throw error
      }
      
      return data as EmployeeDependent[]
    } catch (error) {
      console.error("Erro ao criar dependentes:", error)
      throw new Error("Não foi possível criar os dependentes")
    }
  }

  /**
   * Atualiza um dependente existente
   * @param id ID do dependente
   * @param dependent Dados atualizados
   * @returns Dependente atualizado
   */
  async updateDependent(id: string, dependent: EmployeeDependentUpdate): Promise<EmployeeDependent> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("employee_dependents")
        .update(dependent)
        .eq("id", id)
        .select()
        .single()
      
      if (error) {
        console.error("Erro ao atualizar dependente:", error)
        throw error
      }
      
      return data as EmployeeDependent
    } catch (error) {
      console.error("Erro ao atualizar dependente:", error)
      throw new Error("Não foi possível atualizar o dependente")
    }
  }

  /**
   * Remove um dependente
   * @param id ID do dependente
   * @returns Sucesso ou erro
   */
  async deleteDependent(id: string): Promise<void> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("employee_dependents")
        .delete()
        .eq("id", id)
      
      if (error) {
        console.error("Erro ao excluir dependente:", error)
        throw error
      }
    } catch (error) {
      console.error("Erro ao excluir dependente:", error)
      throw new Error("Não foi possível excluir o dependente")
    }
  }
}

export const dependentService = new DependentService() 