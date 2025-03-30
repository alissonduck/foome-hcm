/**
 * Serviço para gerenciamento de onboarding
 */
import { createClient } from "@/lib/supabase/server"
import { OnboardingTaskInsert, OnboardingTaskUpdate, EmployeeOnboardingInsert, EmployeeOnboardingUpdate, OnboardingFilters, EmployeeOnboardingWithRelations } from "@/lib/types/onboarding"

/**
 * Classe de serviço para gerenciamento de tarefas de onboarding e atribuições
 */
class OnboardingService {
  /**
   * Obtém todas as tarefas de onboarding de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de tarefas de onboarding
   */
  async getTasks(companyId: string) {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("company_id", companyId)
        .order("name")
      
      if (error) {
        console.error("Erro ao obter tarefas de onboarding:", error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error("Erro ao obter tarefas de onboarding:", error)
      throw error
    }
  }
  
  /**
   * Obtém uma tarefa de onboarding específica
   * @param taskId ID da tarefa
   * @returns Tarefa de onboarding
   */
  async getTask(taskId: string) {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("onboarding_tasks")
        .select("*")
        .eq("id", taskId)
        .single()
      
      if (error) {
        console.error("Erro ao obter tarefa de onboarding:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao obter tarefa de onboarding:", error)
      throw error
    }
  }
  
  /**
   * Cria uma nova tarefa de onboarding
   * @param task Dados da tarefa
   * @returns Tarefa criada
   */
  async createTask(task: OnboardingTaskInsert) {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("onboarding_tasks")
        .insert(task)
        .select("*")
        .single()
      
      if (error) {
        console.error("Erro ao criar tarefa de onboarding:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao criar tarefa de onboarding:", error)
      throw error
    }
  }
  
  /**
   * Atualiza uma tarefa de onboarding
   * @param taskId ID da tarefa
   * @param task Dados para atualização
   * @returns Tarefa atualizada
   */
  async updateTask(taskId: string, task: OnboardingTaskUpdate) {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("onboarding_tasks")
        .update(task)
        .eq("id", taskId)
        .select("*")
        .single()
      
      if (error) {
        console.error("Erro ao atualizar tarefa de onboarding:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar tarefa de onboarding:", error)
      throw error
    }
  }
  
  /**
   * Exclui uma tarefa de onboarding
   * @param taskId ID da tarefa
   * @returns Verdadeiro se excluído com sucesso
   */
  async deleteTask(taskId: string) {
    try {
      const supabase = await createClient()
      
      // Verifica se a tarefa está sendo usada em algum onboarding
      const { data: usageCheck, error: checkError } = await supabase
        .from("employee_onboarding")
        .select("id")
        .eq("task_id", taskId)
        .limit(1)
      
      if (checkError) {
        console.error("Erro ao verificar uso da tarefa:", checkError)
        throw checkError
      }
      
      // Se a tarefa estiver em uso, não permite exclusão
      if (usageCheck && usageCheck.length > 0) {
        throw new Error("Esta tarefa está atribuída a funcionários e não pode ser excluída")
      }
      
      const { error } = await supabase
        .from("onboarding_tasks")
        .delete()
        .eq("id", taskId)
      
      if (error) {
        console.error("Erro ao excluir tarefa de onboarding:", error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir tarefa de onboarding:", error)
      throw error
    }
  }
  
  /**
   * Obtém todos os onboardings com base em filtros
   * @param companyId ID da empresa
   * @param isAdmin Indica se o usuário é administrador
   * @param employeeId ID do funcionário (usado se não for admin)
   * @param filters Filtros opcionais (status, employeeId, search)
   * @returns Lista de onboardings
   */
  async getOnboardings(companyId: string, isAdmin: boolean, employeeId?: string, filters?: OnboardingFilters) {
    try {
      const supabase = await createClient()
      
      // Se não for admin, só pode ver seus próprios onboardings
      const query = supabase
        .from("employee_onboarding")
        .select(`
          id, 
          status, 
          due_date, 
          notes, 
          completed_at,
          updated_at,
          created_at,
          employee_id,
          task_id,
          employees!inner (
            id, 
            full_name
          ),
          onboarding_tasks!inner (
            id,
            name,
            description,
            category,
            is_required
          ),
          completed_by (
            full_name
          )
        `)
      
      // Aplicar filtro de empresa/funcionário
      if (isAdmin) {
        query.eq("employees.company_id", companyId)
      } else if (employeeId) {
        query.eq("employee_id", employeeId)
      } else {
        throw new Error("ID do funcionário é necessário para usuários não administradores")
      }
      
      // Aplicar filtros opcionais
      if (filters) {
        if (filters.status) {
          query.eq("status", filters.status)
        }
        
        if (filters.employeeId && isAdmin) {
          query.eq("employee_id", filters.employeeId)
        }
      }
      
      // Executar a consulta
      const { data, error } = await query.order("created_at", { ascending: false })
      
      if (error) {
        console.error("Erro ao obter onboardings:", error)
        throw error
      }
      
      // Aplicar filtro de busca, se fornecido
      let result = data || []
      
      if (filters?.search && result.length > 0) {
        const search = filters.search.toLowerCase()
        result = result.filter(item => {
          const taskName = item.onboarding_tasks?.[0]?.name || "";
          const employeeName = item.employees?.[0]?.full_name || "";
          return taskName.toLowerCase().includes(search) || employeeName.toLowerCase().includes(search);
        })
      }
      
      return result as unknown as EmployeeOnboardingWithRelations[]
    } catch (error) {
      console.error("Erro ao obter onboardings:", error)
      throw error
    }
  }
  
  /**
   * Obtém um onboarding específico
   * @param onboardingId ID do onboarding
   * @returns Detalhes do onboarding
   */
  async getOnboarding(onboardingId: string) {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employee_onboarding")
        .select(`
          id, 
          status, 
          due_date, 
          notes, 
          completed_at,
          updated_at,
          created_at,
          employee_id,
          task_id,
          employees!inner (
            id, 
            full_name
          ),
          onboarding_tasks!inner (
            id,
            name,
            description,
            category,
            is_required
          ),
          completed_by (
            full_name
          )
        `)
        .eq("id", onboardingId)
        .single()
      
      if (error) {
        console.error("Erro ao obter detalhes do onboarding:", error)
        throw error
      }
      
      return data as unknown as EmployeeOnboardingWithRelations
    } catch (error) {
      console.error("Erro ao obter detalhes do onboarding:", error)
      throw error
    }
  }
  
  /**
   * Atribui tarefas a um funcionário
   * @param employeeId ID do funcionário
   * @param taskIds IDs das tarefas
   * @param notes Notas opcionais
   * @param dueDate Data de prazo opcional
   * @returns Lista de onboardings criados
   */
  async assignTasks(employeeId: string, taskIds: string[], notes?: string | null, dueDate?: string | null) {
    try {
      const supabase = await createClient()
      
      // Prepara os dados para inserção
      const insertData = await Promise.all(taskIds.map(async taskId => {
        // Busca a tarefa para obter o prazo padrão, se necessário
        if (!dueDate) {
          const { data: task } = await supabase
            .from("onboarding_tasks")
            .select("default_due_days")
            .eq("id", taskId)
            .single()
          
          if (task?.default_due_days) {
            const date = new Date()
            date.setDate(date.getDate() + task.default_due_days)
            dueDate = date.toISOString().split("T")[0]
          }
        }
        
        return {
          employee_id: employeeId,
          task_id: taskId,
          status: "pending",
          due_date: dueDate,
          notes: notes
        } as EmployeeOnboardingInsert
      }))
      
      // Insere os registros
      const { data, error } = await supabase
        .from("employee_onboarding")
        .insert(insertData)
        .select()
      
      if (error) {
        console.error("Erro ao atribuir tarefas:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atribuir tarefas:", error)
      throw error
    }
  }
  
  /**
   * Atualiza o status de um onboarding
   * @param onboardingId ID do onboarding
   * @param status Novo status
   * @param completedBy ID do funcionário que concluiu (se aplicável)
   * @param notes Notas opcionais
   * @returns Onboarding atualizado
   */
  async updateStatus(onboardingId: string, status: string, completedBy?: string, notes?: string) {
    try {
      const supabase = await createClient()
      
      const updateData: EmployeeOnboardingUpdate = {
        status,
        updated_at: new Date().toISOString()
      }
      
      // Se estiver marcando como concluído, adiciona informações de conclusão
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
        if (completedBy) {
          updateData.completed_by = completedBy
        }
      } else {
        // Se estiver desmarcando, remove informações de conclusão
        updateData.completed_at = null
        updateData.completed_by = null
      }
      
      // Se houver notas, adiciona
      if (notes !== undefined) {
        updateData.notes = notes
      }
      
      const { data, error } = await supabase
        .from("employee_onboarding")
        .update(updateData)
        .eq("id", onboardingId)
        .select()
        .single()
      
      if (error) {
        console.error("Erro ao atualizar status do onboarding:", error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar status do onboarding:", error)
      throw error
    }
  }
  
  /**
   * Exclui um onboarding
   * @param onboardingId ID do onboarding
   * @returns Verdadeiro se excluído com sucesso
   */
  async deleteOnboarding(onboardingId: string) {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from("employee_onboarding")
        .delete()
        .eq("id", onboardingId)
      
      if (error) {
        console.error("Erro ao excluir onboarding:", error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir onboarding:", error)
      throw error
    }
  }
}

// Exporta uma instância única do serviço
export const onboardingService = new OnboardingService() 