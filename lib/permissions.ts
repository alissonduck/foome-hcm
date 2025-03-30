/**
 * Utilitários para verificação de permissões
 * Funções para verificar se um usuário possui determinadas permissões
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/supabase'

/**
 * Verifica se um usuário é administrador
 * 
 * @param supabase Cliente Supabase
 * @param userId ID do usuário a verificar
 * @returns Objeto indicando se o usuário é administrador
 */
export async function isAdmin(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ isAdmin: boolean }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error || !data) {
      console.error('[IS_ADMIN_ERROR]', error)
      return { isAdmin: false }
    }
    
    return { isAdmin: data.role === 'admin' }
  } catch (error) {
    console.error('[IS_ADMIN_ERROR]', error)
    return { isAdmin: false }
  }
} 