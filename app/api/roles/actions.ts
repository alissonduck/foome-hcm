/**
 * Server Actions para operações relacionadas a cargos
 */
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/supabase"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

// Função para obter o cliente Supabase para server actions
const getSupabase = () => {
  return createServerActionClient<Database>({ cookies })
}

// Server Action para criar um novo cargo
export async function createRole(formData: FormData) {
  const supabase = getSupabase()

  // Extrair dados do formulário
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const teamId = formData.get("teamId") as string
  const contractType = formData.get("contractType") as string

  try {
    // Obter o ID da empresa atual
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data: companyData } = await supabase
      .from("user_companies")
      .select("company_id")
      .eq("user_id", user?.id)
      .single()

    if (!companyData) {
      return { error: "Empresa não encontrada" }
    }

    // Inserir o novo cargo
    const { data, error } = await supabase
      .from("roles")
      .insert({
        company_id: companyData.company_id,
        title,
        description,
        team_id: teamId || null,
        contract_type: contractType,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidar o caminho para atualizar os dados
    revalidatePath("/dashboard/roles")

    return { data }
  } catch (error) {
    return { error: "Erro ao criar cargo" }
  }
}

// Server Action para atualizar um cargo existente
export async function updateRole(id: string, formData: FormData) {
  const supabase = getSupabase()

  // Extrair dados do formulário
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const teamId = formData.get("teamId") as string
  const contractType = formData.get("contractType") as string

  try {
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
      return { error: error.message }
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath("/dashboard/roles")
    revalidatePath(`/dashboard/roles/${id}`)

    return { data }
  } catch (error) {
    return { error: "Erro ao atualizar cargo" }
  }
}

// Server Action para alternar o status de atividade de um cargo
export async function toggleRoleActive(id: string) {
  const supabase = getSupabase()

  try {
    // Obter o status atual do cargo
    const { data: roleData, error: roleError } = await supabase.from("roles").select("active").eq("id", id).single()

    if (roleError) {
      return { error: roleError.message }
    }

    // Alternar o status
    const { data, error } = await supabase
      .from("roles")
      .update({
        active: !roleData.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath("/dashboard/roles")
    revalidatePath(`/dashboard/roles/${id}`)

    return { data }
  } catch (error) {
    return { error: "Erro ao alternar status do cargo" }
  }
}

// Server Action para excluir um cargo
export async function deleteRole(id: string) {
  const supabase = getSupabase()

  try {
    // Verificar se há funcionários vinculados ao cargo
    const { data: employeesData, error: employeesError } = await supabase
      .from("role_employees")
      .select("id")
      .eq("role_id", id)
      .eq("is_current", true)

    if (employeesError) {
      return { error: employeesError.message }
    }

    if (employeesData && employeesData.length > 0) {
      return { error: "Não é possível excluir um cargo com funcionários ativos" }
    }

    // Excluir o cargo
    const { error } = await supabase.from("roles").delete().eq("id", id)

    if (error) {
      return { error: error.message }
    }

    // Revalidar o caminho para atualizar os dados
    revalidatePath("/dashboard/roles")

    return { success: true }
  } catch (error) {
    return { error: "Erro ao excluir cargo" }
  }
}

// Server Action para atribuir um cargo a um funcionário
export async function assignRoleToEmployee(formData: FormData) {
  const supabase = getSupabase()

  // Extrair dados do formulário
  const roleId = formData.get("roleId") as string
  const employeeId = formData.get("employeeId") as string
  const startDate = formData.get("startDate") as string

  try {
    // Verificar se o funcionário já tem um cargo atual
    const { data: currentRoleData } = await supabase
      .from("role_employees")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("is_current", true)

    // Se o funcionário já tiver um cargo atual, finalizar esse cargo
    if (currentRoleData && currentRoleData.length > 0) {
      await supabase
        .from("role_employees")
        .update({
          is_current: false,
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("employee_id", employeeId)
        .eq("is_current", true)
    }

    // Atribuir o novo cargo ao funcionário
    const { data, error } = await supabase
      .from("role_employees")
      .insert({
        role_id: roleId,
        employee_id: employeeId,
        start_date: startDate || new Date().toISOString(),
        is_current: true,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath(`/dashboard/employees/${employeeId}`)
    revalidatePath(`/dashboard/roles/${roleId}`)

    return { data }
  } catch (error) {
    return { error: "Erro ao atribuir cargo ao funcionário" }
  }
}

// Server Action para finalizar a atribuição de um cargo a um funcionário
export async function endRoleAssignment(id: string) {
  const supabase = getSupabase()

  try {
    // Obter dados da atribuição
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("role_employees")
      .select("employee_id, role_id")
      .eq("id", id)
      .single()

    if (assignmentError) {
      return { error: assignmentError.message }
    }

    // Finalizar a atribuição
    const { data, error } = await supabase
      .from("role_employees")
      .update({
        is_current: false,
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidar os caminhos para atualizar os dados
    revalidatePath(`/dashboard/employees/${assignmentData.employee_id}`)
    revalidatePath(`/dashboard/roles/${assignmentData.role_id}`)

    return { data }
  } catch (error) {
    return { error: "Erro ao finalizar atribuição de cargo" }
  }
}

