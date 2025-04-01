'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { constructServerResponse, ServerResponse } from '@/lib/utils/server-response'

/**
 * Realiza o login do usuário
 * @param formData Dados do formulário de login
 * @returns Resposta de sucesso ou erro
 */
export async function login(formData: FormData): Promise<ServerResponse> {
  try {
    const supabase = await createClient()

    // Extrai dados do formulário
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Valida os campos
    if (!data.email || !data.password) {
      return constructServerResponse({
        success: false,
        error: 'E-mail e senha são obrigatórios'
      })
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    revalidatePath('/', 'layout')
    
    return constructServerResponse({
      success: true,
      data: authData,
      message: 'Login realizado com sucesso'
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao fazer login"
    })
  }
}

/**
 * Realiza o cadastro de um novo usuário
 * @param formData Dados do formulário de cadastro
 * @returns Resposta de sucesso ou erro
 */
export async function signup(formData: FormData): Promise<ServerResponse> {
  try {
    const supabase = await createClient()

    // Extrai dados do formulário
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Valida os campos
    if (!data.email || !data.password) {
      return constructServerResponse({
        success: false,
        error: 'E-mail e senha são obrigatórios'
      })
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
      return constructServerResponse({
        success: false,
        error: error.message
      })
    }

    revalidatePath('/', 'layout')
    
    return constructServerResponse({
      success: true,
      data: authData,
      message: 'Cadastro realizado com sucesso'
    })
  } catch (error) {
    console.error("Erro ao fazer cadastro:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao fazer cadastro"
    })
  }
}