"use server"

/**
 * Server actions para gerenciamento de documentos
 * Fornece ações do servidor para operações com documentos
 */
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { 
  EmployeeDocumentInsert, 
  EmployeeDocumentUpdate, 
  DocumentWithEmployee,
  DocumentStatus
} from "@/lib/types/documents"

// Interfaces para os tipos retornados pelo Supabase
interface DocumentWithCompanyId {
  id: string
  employee_id: string
  employees: {
    company_id: string
  }[]
  [key: string]: any
}

interface DocumentWithUserId {
  id: string
  employee_id: string
  file_path?: string
  employees: {
    company_id: string
    user_id: string
  }[]
  [key: string]: any
}

/**
 * Obtém todos os documentos de um funcionário ou empresa
 * @param employeeId ID do funcionário (se null, busca documentos de toda a empresa)
 * @returns Lista de documentos
 */
export async function getDocuments(employeeId: string | null = null) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    let query = supabase
      .from("employee_documents")
      .select(`
        *,
        employees:employee_id (
          id, 
          full_name,
          email
        )
      `)
    
    // Se for um funcionário específico
    if (employeeId) {
      query = query.eq("employee_id", employeeId)
    } else {
      // Primeiro obtém os IDs dos funcionários da empresa
      const { data: employeeIds } = await supabase
        .from("employees")
        .select("id")
        .eq("company_id", company.id)
      
      if (employeeIds && employeeIds.length > 0) {
        // Filtra os documentos pelos IDs dos funcionários
        query = query.in("employee_id", employeeIds.map(e => e.id))
      }
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) {
      console.error("Erro na consulta:", error)
      throw error
    }
    
    return data as DocumentWithEmployee[]
  } catch (error) {
    console.error("Erro ao buscar documentos:", error)
    throw new Error(`Não foi possível buscar os documentos: ${error instanceof Error ? error.message : String(error)}`)
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
    
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name, is_admin")
      .eq("company_id", company.id)
      .order("full_name")
    
    if (error) {
      console.error("Erro na consulta:", error)
      throw error
    }
    
    return data
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
      console.error("Erro na consulta:", error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error("Erro ao buscar funcionário atual:", error)
    throw new Error(`Não foi possível buscar o funcionário atual: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Atualiza o status de um documento
 * @param documentId ID do documento
 * @param status Novo status
 */
export async function updateDocumentStatus(documentId: string, status: DocumentStatus) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    if (!company.isAdmin) {
      throw new Error("Apenas administradores podem aprovar ou rejeitar documentos")
    }
    
    const supabase = await createClient()
    
    // Verifica se o documento existe e pertence a um funcionário da empresa
    const { data: document, error: fetchError } = await supabase
      .from("employee_documents")
      .select(`
        id, 
        employee_id,
        employees:employee_id (
          company_id
        )
      `)
      .eq("id", documentId)
      .single()
    
    if (fetchError || !document) {
      throw new Error("Documento não encontrado")
    }
    
    const typedDocument = document as DocumentWithCompanyId
    
    if (typedDocument.employees.length === 0 || typedDocument.employees[0].company_id !== company.id) {
      throw new Error("Documento não pertence à sua empresa")
    }
    
    // Atualiza o status
    const { data, error } = await supabase
      .from("employee_documents")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", documentId)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao atualizar status:", error)
      throw error
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/documents")
    
    return { success: true, document: data }
  } catch (error) {
    console.error("Erro ao atualizar status do documento:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar status do documento" 
    }
  }
}

/**
 * Remove um documento
 * @param documentId ID do documento
 */
export async function deleteDocument(documentId: string) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Verifica se o documento existe e pertence a um funcionário da empresa
    const { data: document, error: fetchError } = await supabase
      .from("employee_documents")
      .select(`
        id, 
        employee_id,
        file_path,
        employees:employee_id (
          company_id,
          user_id
        )
      `)
      .eq("id", documentId)
      .single()
    
    if (fetchError || !document) {
      throw new Error("Documento não encontrado")
    }
    
    const typedDocument = document as DocumentWithUserId
    
    if (typedDocument.employees.length === 0) {
      throw new Error("Documento não possui informações de funcionário")
    }
    
    // Verifica se o usuário tem permissão (admin ou dono do documento)
    const isAdmin = company.isAdmin
    const isOwner = typedDocument.employees[0].user_id === company.userId
    
    if (!isAdmin && !isOwner) {
      throw new Error("Você não tem permissão para excluir este documento")
    }
    
    // Exclui o registro do banco de dados
    const { error: deleteError } = await supabase
      .from("employee_documents")
      .delete()
      .eq("id", documentId)
    
    if (deleteError) {
      throw deleteError
    }
    
    // Se o documento tem um arquivo associado, exclui do storage
    if (typedDocument.file_path) {
      const { error: storageError } = await supabase
        .storage
        .from("documents")
        .remove([typedDocument.file_path])
      
      if (storageError) {
        console.error("Erro ao excluir arquivo do storage:", storageError)
      }
    }
    
    // Revalida as páginas relevantes
    revalidatePath("/dashboard/documents")
    
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir documento:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao excluir documento" 
    }
  }
}

/**
 * Obtém uma URL assinada para download de arquivo
 * @param filePath Caminho do arquivo
 * @param expiresIn Tempo de expiração em segundos
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 60) {
  try {
    if (!filePath) {
      throw new Error("Caminho do arquivo não fornecido")
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .storage
      .from("documents")
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      throw error
    }
    
    return { success: true, url: data.signedUrl }
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao gerar URL assinada" 
    }
  }
}

// Adicionar action para upload de documentos
/**
 * Server action para upload de arquivo e criação de documento
 * @param formData FormData com os dados do documento
 */
export async function uploadDocument(formData: FormData) {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      throw new Error("Empresa não encontrada ou usuário não autenticado")
    }
    
    const supabase = await createClient()
    
    // Extrai os dados do formulário
    const employeeId = formData.get("employeeId") as string
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const expirationDate = formData.get("expirationDate") as string
    const file = formData.get("file") as File
    
    if (!employeeId || !name || !type || !file) {
      throw new Error("Dados do formulário incompletos")
    }
    
    // Verifica se o funcionário existe e pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .single()
    
    if (employeeError || !employee) {
      throw new Error("Funcionário não encontrado")
    }
    
    if (employee.company_id !== company.id) {
      throw new Error("Este funcionário não pertence à sua empresa")
    }
    
    // Gera um nome único para o arquivo
    const timestamp = Date.now()
    const fileExt = file.name.split(".").pop()
    const fileName = `${employeeId}/${timestamp}-${file.name}`
    
    // Upload do arquivo para o storage
    const { data: fileData, error: uploadError } = await supabase
      .storage
      .from("documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      })
    
    if (uploadError) {
      throw uploadError
    }
    
    // Cria o registro do documento no banco de dados
    const documentData: EmployeeDocumentInsert = {
      employee_id: employeeId,
      name,
      type,
      status: "pending",
      file_path: fileData.path,
      file_name: file.name,
      file_size: file.size,
      expiration_date: expirationDate || null,
    }
    
    const { data: document, error: insertError } = await supabase
      .from("employee_documents")
      .insert([documentData])
      .select()
      .single()
    
    if (insertError) {
      // Se ocorrer erro na inserção, remove o arquivo do storage
      await supabase.storage.from("documents").remove([fileData.path])
      throw insertError
    }
    
    // Revalida a página
    revalidatePath("/dashboard/documents")
    
    return { success: true, document }
  } catch (error) {
    console.error("Erro ao fazer upload de documento:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload de documento" 
    }
  }
} 