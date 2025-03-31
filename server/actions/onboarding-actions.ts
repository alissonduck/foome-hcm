"use server"

/**
 * Server actions para gerenciamento de onboarding
 * Fornece ações do servidor para operações com tarefas de onboarding e atribuições
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { 
  OnboardingTaskInsert, 
  OnboardingTaskUpdate, 
  EmployeeOnboardingInsert,
  EmployeeOnboardingUpdate,
  EmployeeOnboardingWithRelations,
  OnboardingFilters,
  OnboardingStatus
} from "@/lib/types/onboarding"

/**
 * Obtém todas as tarefas de onboarding de uma empresa
 * @returns Lista de tarefas de onboarding
 */
export async function getTasks() {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("onboarding_tasks")
      .select("*")
      .eq("company_id", company.id)
      .order("name")
    
    if (error) {
      console.error("Erro ao obter tarefas de onboarding:", error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error("Erro ao obter tarefas de onboarding:", error)
    throw new Error(`Não foi possível buscar as tarefas: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém uma tarefa de onboarding específica
 * @param taskId ID da tarefa
 * @returns Tarefa de onboarding
 */
export async function getTask(taskId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
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
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (data.company_id !== company.id) {
      throw new Error("Acesso negado a esta tarefa")
    }
    
    return data
  } catch (error) {
    console.error("Erro ao obter tarefa de onboarding:", error)
    throw new Error(`Não foi possível buscar a tarefa: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém os funcionários da empresa atual
 * @returns Lista de funcionários
 */
export async function getEmployees() {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca os dados do funcionário logado
    const { data: currentEmployee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id, is_admin")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !currentEmployee) {
      throw new Error("Dados do funcionário não encontrados")
    }
    
    // Busca todos os funcionários da empresa
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("company_id", currentEmployee.company_id)
      .order("full_name")
    
    if (error) {
      console.error("Erro ao buscar funcionários:", error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    throw new Error(`Não foi possível buscar os funcionários: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém o funcionário atual
 * @returns Dados do funcionário atual
 */
export async function getCurrentEmployee() {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("employees")
      .select("id, company_id, is_admin")
      .eq("user_id", company.userId)
      .single()
    
    if (error) {
      console.error("Erro ao buscar funcionário atual:", error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error("Erro ao buscar funcionário atual:", error)
    throw new Error(`Não foi possível buscar o funcionário atual: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtém todos os onboardings com base em filtros
 * @param filters Filtros opcionais (status, employeeId, search)
 * @returns Lista de onboardings
 */
export async function getOnboardings(filters?: OnboardingFilters) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca os dados do funcionário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id, is_admin")
      .eq("user_id", company.userId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Dados do funcionário não encontrados")
    }
    
    const isAdmin = employee.is_admin || false
    
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
      query.eq("employees.company_id", employee.company_id)
    } else {
      query.eq("employee_id", employee.id)
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
    throw new Error(`Não foi possível buscar os onboardings: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Cria uma nova tarefa de onboarding
 * @param task Dados da tarefa
 * @returns Tarefa criada
 */
export async function createTask(task: OnboardingTaskInsert) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem criar tarefas de onboarding")
    }
    
    // Garante que a tarefa será criada para a empresa do usuário
    task.company_id = company.id
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("onboarding_tasks")
      .insert(task)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao criar tarefa de onboarding:", error)
      throw error
    }
    
    // Revalida a página
    revalidatePath("/dashboard/onboarding")
    
    return { success: true, task: data }
  } catch (error) {
    console.error("Erro ao criar tarefa de onboarding:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao criar tarefa de onboarding"
    }
  }
}

/**
 * Atualiza uma tarefa de onboarding
 * @param taskId ID da tarefa
 * @param task Dados da tarefa
 * @returns Tarefa atualizada
 */
export async function updateTask(taskId: string, task: OnboardingTaskUpdate) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem atualizar tarefas de onboarding")
    }
    
    const supabase = await createClient()
    
    // Verifica se a tarefa existe e pertence à empresa do usuário
    const { data: existingTask, error: fetchError } = await supabase
      .from("onboarding_tasks")
      .select("company_id")
      .eq("id", taskId)
      .single()
    
    if (fetchError || !existingTask) {
      throw new Error("Tarefa não encontrada")
    }
    
    if (existingTask.company_id !== company.id) {
      throw new Error("Acesso negado a esta tarefa")
    }
    
    // Remove o company_id se estiver presente para evitar alteração da propriedade
    if (task.company_id) {
      delete task.company_id
    }
    
    const { data, error } = await supabase
      .from("onboarding_tasks")
      .update(task)
      .eq("id", taskId)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao atualizar tarefa de onboarding:", error)
      throw error
    }
    
    // Revalida a página
    revalidatePath("/dashboard/onboarding")
    
    return { success: true, task: data }
  } catch (error) {
    console.error("Erro ao atualizar tarefa de onboarding:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar tarefa de onboarding"
    }
  }
}

/**
 * Exclui uma tarefa de onboarding
 * @param taskId ID da tarefa a ser excluída
 * @returns Status da operação
 */
export async function deleteTask(taskId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    // Apenas admin pode excluir tarefas
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem excluir tarefas")
    }
    
    const supabase = await createClient()
    
    // Verifica se a tarefa pertence à empresa
    const { data: task, error: taskError } = await supabase
      .from("onboarding_tasks")
      .select("id, company_id")
      .eq("id", taskId)
      .single()
    
    if (taskError || !task) {
      throw new Error("Tarefa não encontrada")
    }
    
    if (task.company_id !== company.id) {
      throw new Error("Esta tarefa não pertence à sua empresa")
    }
    
    // Verifica se a tarefa está sendo usada em algum onboarding
    const { data: usedTasks, error: checkError } = await supabase
      .from("employee_onboarding")
      .select("id")
      .eq("task_id", taskId)
      .limit(1)
    
    if (checkError) {
      throw checkError
    }
    
    if (usedTasks && usedTasks.length > 0) {
      throw new Error("Esta tarefa está sendo usada em um ou mais onboardings e não pode ser excluída")
    }
    
    // Exclui a tarefa
    const { error } = await supabase
      .from("onboarding_tasks")
      .delete()
      .eq("id", taskId)
    
    if (error) {
      throw error
    }
    
    // Revalida a página
    revalidatePath("/dashboard/onboarding")
    
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao excluir tarefa"
    }
  }
}

/**
 * Atribui tarefas a um funcionário
 * @param assignments Array de atribuições (contendo employee_id, task_id, etc)
 * @returns Status da operação
 */
export async function assignTasks(assignments: Array<{
  employee_id: string;
  task_id: string;
  status: string;
  due_date: string | null;
  notes: string | null;
}>): Promise<{ success: boolean; data?: any; error?: string }>;

/**
 * Atribui tarefas a um funcionário
 * @param employeeId ID do funcionário
 * @param taskIds IDs das tarefas
 * @param notes Notas opcionais
 * @param dueDate Data de prazo opcional
 * @returns Status da operação
 */
export async function assignTasks(
  employeeIdOrAssignments: string | Array<{
    employee_id: string;
    task_id: string;
    status: string;
    due_date: string | null;
    notes: string | null;
  }>,
  taskIds?: string[],
  notes?: string | null,
  dueDate?: string | null
) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Determina se estamos tratando um array de atribuições ou parâmetros individuais
    let assignments: Array<{
      employee_id: string;
      task_id: string;
      status: string;
      due_date: string | null;
      notes: string | null;
    }> = [];
    
    let employeeId: string;
    
    if (Array.isArray(employeeIdOrAssignments)) {
      // Temos um array de atribuições
      assignments = employeeIdOrAssignments;
      
      if (assignments.length === 0) {
        throw new Error("Nenhuma atribuição foi fornecida");
      }
      
      // Verifica se todas as atribuições têm o mesmo funcionário
      employeeId = assignments[0].employee_id;
      if (!assignments.every(a => a.employee_id === employeeId)) {
        throw new Error("Todas as atribuições devem ser para o mesmo funcionário");
      }
    } else {
      // Temos parâmetros individuais
      employeeId = employeeIdOrAssignments;
      
      if (!taskIds || taskIds.length === 0) {
        throw new Error("Nenhuma tarefa foi selecionada");
      }
      
      // Prepara os dados como atribuições
      assignments = taskIds.map(taskId => ({
        employee_id: employeeId,
        task_id: taskId,
        status: "pending",
        due_date: dueDate || null,
        notes: notes || null
      }));
    }
    
    // Verifica se o usuário tem permissão (admin ou é o próprio funcionário)
    if (!company.isAdmin && employeeId !== company.userId) {
      throw new Error("Você não tem permissão para atribuir tarefas a este funcionário")
    }
    
    // Verifica se o funcionário pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("company_id")
      .eq("id", employeeId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    if (employee.company_id !== company.id) {
      throw new Error("Este funcionário não pertence à sua empresa")
    }
    
    // Extrai os IDs das tarefas
    const taskIdsArray = assignments.map(a => a.task_id);
    
    // Verifica se todas as tarefas pertencem à empresa
    const { data: tasks, error: tasksError } = await supabase
      .from("onboarding_tasks")
      .select("id, company_id, default_due_days")
      .in("id", taskIdsArray)
    
    if (tasksError) {
      throw tasksError
    }
    
    // Verifica se todas as tarefas foram encontradas
    if (!tasks || tasks.length !== taskIdsArray.length) {
      throw new Error("Uma ou mais tarefas não foram encontradas")
    }
    
    // Verifica se todas as tarefas pertencem à empresa
    for (const task of tasks) {
      if (task.company_id !== company.id) {
        throw new Error("Uma ou mais tarefas não pertencem à sua empresa")
      }
    }
    
    // Prepara os dados para inserção, adicionando datas de prazo padrão quando necessário
    const insertData = assignments.map(assignment => {
      // Se não tiver uma data de prazo, tenta usar o prazo padrão da tarefa
      if (!assignment.due_date) {
        const task = tasks.find(t => t.id === assignment.task_id);
        if (task?.default_due_days) {
          const date = new Date();
          date.setDate(date.getDate() + task.default_due_days);
          assignment.due_date = date.toISOString().split("T")[0];
        }
      }
      
      return assignment as EmployeeOnboardingInsert;
    });
    
    // Insere os registros
    const { data, error } = await supabase
      .from("employee_onboarding")
      .insert(insertData)
      .select()
    
    if (error) {
      throw error
    }
    
    // Revalida a página
    revalidatePath("/dashboard/onboarding")
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atribuir tarefas:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atribuir tarefas"
    }
  }
}

/**
 * Atualiza o status de um onboarding
 * @param onboardingId ID do onboarding
 * @param status Novo status
 * @returns Status da operação
 */
export async function updateOnboardingStatus(onboardingId: string, status: OnboardingStatus) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Busca o onboarding para verificar permissões
    const { data: onboarding, error: fetchError } = await supabase
      .from("employee_onboarding")
      .select(`
        id, 
        employee_id,
        employees!inner (
          id,
          company_id
        )
      `)
      .eq("id", onboardingId)
      .single()
    
    if (fetchError || !onboarding) {
      throw new Error("Onboarding não encontrado")
    }
    
    // Verifica se o onboarding pertence a um funcionário da empresa
    if (onboarding.employees[0]?.company_id !== company.id) {
      throw new Error("Este onboarding não pertence à sua empresa")
    }
    
    // Apenas admin ou o próprio funcionário pode atualizar o status
    if (!company.isAdmin && onboarding.employee_id !== company.userId) {
      throw new Error("Você não tem permissão para atualizar este onboarding")
    }
    
    const updateData: EmployeeOnboardingUpdate = { 
      status,
      updated_at: new Date().toISOString()
    }
    
    // Se estiver marcando como concluído, registra quem completou e quando
    if (status === "completed") {
      const { data: currentEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", company.userId)
        .single()
      
      updateData.completed_by = currentEmployee?.id
      updateData.completed_at = new Date().toISOString()
    }
    
    // Atualiza o status
    const { data, error } = await supabase
      .from("employee_onboarding")
      .update(updateData)
      .eq("id", onboardingId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // Revalida a página
    revalidatePath("/dashboard/onboarding")
    
    return { success: true, data }
  } catch (error) {
    console.error("Erro ao atualizar status do onboarding:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar status"
    }
  }
} 