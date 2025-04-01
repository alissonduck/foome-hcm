"use server"

/**
 * Server actions para registro de usuário e empresa
 * Implementa ações do servidor para processos de registro
 */

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"
import { userRegisterSchema, adminFormSchema, companyFormSchema } from "@/lib/schemas/register-schema"
import type { UserRegisterData, CompanyData, AdminData } from "@/lib/types/register"

/**
 * Registra um novo usuário
 * @param formData Dados do formulário ou objeto com dados de registro
 * @returns Resposta com resultado do registro
 */
export async function registerUser(formData: FormData | UserRegisterData): Promise<ServerResponse> {
  try {
    const supabase = await createClient()
    
    // Extrai dados do formulário ou usa objeto diretamente
    const data = formData instanceof FormData 
      ? {
          fullName: formData.get("fullName") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          phone: formData.get("phone") as string,
        }
      : formData
    
    // Valida os dados com o schema Zod
    const validationResult = userRegisterSchema.safeParse(data)
    
    if (!validationResult.success) {
      return constructServerResponse({
        success: false,
        error: "Dados de registro inválidos",
        validation: validationResult.error.format()
      })
    }
    
    // Registra o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validationResult.data.email,
      password: validationResult.data.password,
      options: {
        data: {
          full_name: validationResult.data.fullName,
          phone: validationResult.data.phone,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    })
    
    if (authError) {
      return constructServerResponse({
        success: false,
        error: authError.message
      })
    }
    
    // Verifica se o usuário foi criado e precisa de confirmação
    if (authData.user && !authData.session) {
      return constructServerResponse({
        success: true,
        message: "Conta criada com sucesso! Por favor, verifique seu email para confirmar o cadastro.",
        requireEmailConfirmation: true,
        data: { userId: authData.user.id }
      })
    }
    
    return constructServerResponse({
      success: true,
      message: "Conta criada com sucesso!",
      data: { 
        user: authData.user, 
        session: authData.session 
      }
    })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao registrar usuário"
    })
  }
}

/**
 * Registra uma nova empresa e seu administrador
 * @param companyData Dados da empresa
 * @param adminData Dados do administrador
 * @param userId ID do usuário que está criando a empresa
 * @returns Resposta com resultado do registro
 */
export async function registerCompany(
  companyData: FormData | CompanyData,
  adminData: FormData | AdminData,
  userId: string
): Promise<ServerResponse> {
  try {
    const supabase = await createClient()
    
    // Processa dados da empresa
    const companyValues = companyData instanceof FormData 
      ? {
          name: companyData.get("name") as string,
          cnpj: companyData.get("cnpj") as string,
          sizeRange: companyData.get("sizeRange") as string,
          created_by: userId
        }
      : { ...companyData, created_by: userId }
    
    // Valida dados da empresa
    const companyValidation = companyFormSchema.safeParse({
      name: companyValues.name,
      cnpj: companyValues.cnpj,
      sizeRange: companyValues.sizeRange
    })
    
    if (!companyValidation.success) {
      return constructServerResponse({
        success: false,
        error: "Dados da empresa inválidos",
        validation: companyValidation.error.format()
      })
    }
    
    // Processa dados do administrador
    const adminValues = adminData instanceof FormData 
      ? {
          fullName: adminData.get("fullName") as string,
          email: adminData.get("email") as string,
          phone: adminData.get("phone") as string,
          position: adminData.get("position") as string,
          department: adminData.get("department") as string
        }
      : adminData
    
    // Valida dados do administrador
    const adminValidation = adminFormSchema.safeParse(adminValues)
    
    if (!adminValidation.success) {
      return constructServerResponse({
        success: false,
        error: "Dados do administrador inválidos",
        validation: adminValidation.error.format()
      })
    }
    
    // Inicia uma transação para criar empresa e administrador
    // Cria a empresa
    const { data: companyResult, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyValues.name,
        cnpj: companyValues.cnpj,
        size_range: companyValues.sizeRange,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single()
    
    if (companyError) {
      return constructServerResponse({
        success: false,
        error: `Erro ao criar empresa: ${companyError.message}`
      })
    }
    
    // Cria o funcionário administrador
    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .insert({
        company_id: companyResult.id,
        user_id: userId,
        full_name: adminValues.fullName,
        email: adminValues.email,
        phone: adminValues.phone,
        position: adminValues.position,
        department: adminValues.department,
        status: "active",
        contract_type: "clt",
        is_admin: true,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single()
    
    if (employeeError) {
      return constructServerResponse({
        success: false,
        error: `Erro ao criar administrador: ${employeeError.message}`
      })
    }
    
    // Revalida os caminhos para garantir dados atualizados
    revalidatePath("/dashboard")
    
    return constructServerResponse({
      success: true,
      message: "Empresa e administrador cadastrados com sucesso!",
      data: { 
        companyId: companyResult.id,
        employeeId: employeeData.id
      }
    })
  } catch (error) {
    console.error("Erro ao registrar empresa:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao registrar empresa"
    })
  }
}

/**
 * Verifica se o usuário já possui uma empresa cadastrada
 * @param userId ID do usuário
 * @returns Resposta indicando se o usuário possui empresa e dados da empresa
 */
export async function checkUserCompany(userId: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient()
    
    // Busca o funcionário associado ao usuário
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id, companies(id, name)")
      .eq("user_id", userId)
      .single()
    
    if (employeeError && employeeError.code !== "PGRST116") { // Ignora erro de não encontrado
      return constructServerResponse({
        success: false,
        error: employeeError.message
      })
    }
    
    // Verifica se o funcionário existe e tem empresa
    if (employee && employee.company_id) {
      return constructServerResponse({
        success: true,
        hasCompany: true,
        data: {
          employeeId: employee.id,
          companyId: employee.company_id,
          companyName: employee.companies && Array.isArray(employee.companies) 
            ? (employee.companies[0] as any)?.name 
            : (employee.companies as any)?.name || null
        }
      })
    }
    
    return constructServerResponse({
      success: true,
      hasCompany: false
    })
  } catch (error) {
    console.error("Erro ao verificar empresa do usuário:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao verificar empresa"
    })
  }
} 