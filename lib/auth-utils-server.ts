/**
 * Utilitários para autenticação e gerenciamento de sessão (Server Components)
 */
import { createClient } from "@/lib/supabase/server"

/**
 * Obtém a empresa atual do usuário logado
 * @returns Dados da empresa atual ou null se não encontrada
 */
export async function getCurrentCompany() {
  try {
    const supabase = await createClient()

    // Busca os dados do usuário autenticado usando método seguro
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Busca os dados do funcionário logado
    const { data: employee } = await supabase
      .from("employees")
      .select("company_id, is_admin")
      .eq("user_id", user.id)
      .single()

    if (!employee) {
      return null
    }

    // Busca os dados da empresa
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", employee.company_id)
      .single()

    if (!company) {
      return null
    }

    return {
      ...company,
      isAdmin: employee.is_admin,
      userId: user.id,
    }
  } catch (error) {
    console.error("Erro ao obter empresa atual:", error)
    return null
  }
}

/**
 * Verifica se o usuário está autenticado
 * @returns Verdadeiro se o usuário estiver autenticado
 */
export async function isAuthenticated() {
  try {
    const supabase = await createClient()

    // Verifica autenticação com método seguro
    const { data: { user } } = await supabase.auth.getUser()

    return !!user
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return false
  }
}

/**
 * Verifica se o usuário é administrador
 * @returns Verdadeiro se o usuário for administrador
 */
export async function isAdmin() {
  try {
    const supabase = await createClient()

    // Busca o usuário de forma segura
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()

    return !!employee?.is_admin
  } catch (error) {
    console.error("Erro ao verificar se é admin:", error)
    return false
  }
}

/**
 * Obtém o ID da empresa do usuário logado
 * @returns ID da empresa ou null se não encontrado
 */
export async function getCompanyId() {
  try {
    const supabase = await createClient()

    // Busca o usuário de forma segura
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("company_id")
      .eq("user_id", user.id)
      .single()

    return employee?.company_id || null
  } catch (error) {
    console.error("Erro ao obter ID da empresa:", error)
    return null
  }
}

