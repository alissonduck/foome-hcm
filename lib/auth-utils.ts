/**
 * Utilitários para autenticação e gerenciamento de sessão (Client Components)
 */
import { createClient } from "@/lib/supabase/client"

/**
 * Obtém a empresa atual do usuário logado (versão cliente)
 * @returns Promise com os dados da empresa atual ou null se não encontrada
 */
export async function getCurrentCompany() {
  const supabase = createClient()

  // Busca os dados do usuário autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Busca os dados do funcionário logado
  const { data: employee } = await supabase
    .from("employees")
    .select("company_id, is_admin")
    .eq("user_id", session.user.id)
    .single()

  if (!employee) {
    return null
  }

  // Busca os dados da empresa
  const { data: company } = await supabase.from("companies").select("*").eq("id", employee.company_id).single()

  if (!company) {
    return null
  }

  return {
    ...company,
    isAdmin: employee.is_admin,
    userId: session.user.id,
  }
}

/**
 * Verifica se o usuário está autenticado (versão cliente)
 * @returns Promise com verdadeiro se o usuário estiver autenticado
 */
export async function isAuthenticated() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return !!session
}

/**
 * Verifica se o usuário é administrador (versão cliente)
 * @returns Promise com verdadeiro se o usuário for administrador
 */
export async function isAdmin() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const { data: employee } = await supabase.from("employees").select("is_admin").eq("user_id", session.user.id).single()

  return !!employee?.is_admin
}

/**
 * Obtém o ID da empresa do usuário logado (versão cliente)
 * @returns Promise com o ID da empresa ou null se não encontrado
 */
export async function getCompanyId() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  return employee?.company_id || null
}

