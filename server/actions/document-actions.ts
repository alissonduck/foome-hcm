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
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"

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
export async function getDocuments(employeeId: string | null = null): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
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
    
    return constructServerResponse({
      success: true,
      data: data as DocumentWithEmployee[],
      message: "Documentos obtidos com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar documentos:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar os documentos: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém os funcionários da empresa atual
 * @returns Lista de funcionários
 */
export async function getEmployees(): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
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
    
    return constructServerResponse({
      success: true,
      data,
      message: "Funcionários obtidos com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar os funcionários: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém o funcionário atual
 * @returns Dados do funcionário atual
 */
export async function getCurrentEmployee(): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
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
    
    return constructServerResponse({
      success: true,
      data,
      message: "Funcionário atual obtido com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar funcionário atual:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível buscar o funcionário atual: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Atualiza o status de um documento
 * @param documentId ID do documento
 * @param status Novo status
 */
export async function updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    if (!company.isAdmin) {
      return constructServerResponse({
        success: false,
        error: "Apenas administradores podem aprovar ou rejeitar documentos"
      })
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
      return constructServerResponse({
        success: false,
        error: "Documento não encontrado"
      })
    }
    
    const typedDocument = document as DocumentWithCompanyId
    
    if (typedDocument.employees.length === 0 || typedDocument.employees[0].company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Documento não pertence à sua empresa"
      })
    }
    
    // Atualiza o status
    const { data: updatedDocument, error } = await supabase
      .from("employee_documents")
      .update({
        status,
        approved_by: status === "approved" ? company.userId : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        rejected_at: status === "rejected" ? new Date().toISOString() : null
      })
      .eq("id", documentId)
      .select()
      .single()
    
    if (error) {
      console.error("Erro ao atualizar status:", error)
      throw error
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/documents")
    revalidatePath(`/dashboard/employees/${typedDocument.employee_id}`)
    
    return constructServerResponse({
      success: true,
      data: updatedDocument,
      message: `Documento ${status === "approved" ? "aprovado" : "rejeitado"} com sucesso`
    })
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível atualizar o status do documento: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Remove um documento
 * @param documentId ID do documento
 */
export async function deleteDocument(documentId: string): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // Busca o documento para verificar permissões
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
      return constructServerResponse({
        success: false,
        error: "Documento não encontrado"
      })
    }
    
    const typedDocument = document as DocumentWithUserId
    
    // Verifica se é admin ou o próprio funcionário que enviou o documento
    const isAdmin = company.isAdmin
    const isOwnDocument = typedDocument.employees[0].user_id === company.userId
    
    if (!isAdmin && !isOwnDocument) {
      return constructServerResponse({
        success: false,
        error: "Sem permissão para excluir este documento"
      })
    }
    
    // Verifica se o documento pertence à empresa
    if (typedDocument.employees[0].company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Documento não pertence à sua empresa"
      })
    }
    
    // Exclui o arquivo do storage
    if (typedDocument.file_path) {
      const { error: storageError } = await supabase
        .storage
        .from("documents")
        .remove([typedDocument.file_path.replace("documents/", "")])
      
      if (storageError) {
        console.error("Erro ao excluir arquivo do storage:", storageError)
      }
    }
    
    // Exclui o registro do documento
    const { error } = await supabase
      .from("employee_documents")
      .delete()
      .eq("id", documentId)
    
    if (error) {
      console.error("Erro ao excluir documento:", error)
      throw error
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/documents")
    revalidatePath(`/dashboard/employees/${typedDocument.employee_id}`)
    
    return constructServerResponse({
      success: true,
      message: "Documento excluído com sucesso"
    })
  } catch (error) {
    console.error("Erro ao excluir documento:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível excluir o documento: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Obtém uma URL assinada para visualizar um documento
 * @param filePath Caminho do arquivo
 * @param expiresIn Tempo de expiração em segundos
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 60): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    const supabase = await createClient()
    
    // O caminho no storage não inclui o nome do bucket
    const path = filePath.replace("documents/", "")
    
    const { data, error } = await supabase
      .storage
      .from("documents")
      .createSignedUrl(path, expiresIn)
    
    if (error) {
      console.error("Erro ao gerar URL assinada:", error)
      throw error
    }
    
    return constructServerResponse({
      success: true,
      data: { url: data.signedUrl },
      message: "URL assinada gerada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível gerar a URL: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Faz upload de um documento
 * @param formData Dados do formulário de upload
 */
export async function uploadDocument(formData: FormData): Promise<ServerResponse> {
  try {
    const company = await getCurrentCompany()
    
    if (!company) {
      return constructServerResponse({
        success: false,
        error: "Empresa não encontrada ou usuário não autenticado"
      })
    }
    
    // Extrai os dados do formulário
    const file = formData.get("file") as File
    const employeeId = formData.get("employeeId") as string
    const documentType = formData.get("documentType") as string
    const description = formData.get("description") as string
    
    if (!file || !employeeId || !documentType) {
      return constructServerResponse({
        success: false,
        error: "Dados incompletos"
      })
    }
    
    const supabase = await createClient()
    
    // Verifica se o funcionário pertence à empresa
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id, user_id")
      .eq("id", employeeId)
      .single()
    
    if (employeeError || !employee) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não encontrado"
      })
    }
    
    if (employee.company_id !== company.id) {
      return constructServerResponse({
        success: false,
        error: "Funcionário não pertence à sua empresa"
      })
    }
    
    // Verifica permissões (se é admin ou o próprio funcionário)
    const isAdmin = company.isAdmin
    const isOwnDocument = employee.user_id === company.userId
    
    if (!isAdmin && !isOwnDocument) {
      return constructServerResponse({
        success: false,
        error: "Sem permissão para enviar documentos para este funcionário"
      })
    }
    
    // Gera um nome único para o arquivo
    const timestamp = new Date().getTime()
    const fileExt = file.name.split(".").pop()
    const fileName = `${employeeId}/${documentType}_${timestamp}.${fileExt}`
    
    // Faz upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      })
    
    if (uploadError) {
      console.error("Erro ao fazer upload:", uploadError)
      throw uploadError
    }
    
    // Salva o registro do documento
    const { data: document, error: insertError } = await supabase
      .from("employee_documents")
      .insert({
        employee_id: employeeId,
        document_type: documentType,
        description: description || documentType,
        file_name: file.name,
        file_path: `documents/${fileName}`,
        file_size: file.size,
        file_type: file.type,
        status: "pending",
        uploaded_by: company.userId
      })
      .select()
      .single()
    
    if (insertError) {
      console.error("Erro ao salvar documento:", insertError)
      
      // Tenta remover o arquivo se falhou ao salvar o registro
      await supabase
        .storage
        .from("documents")
        .remove([fileName])
      
      throw insertError
    }
    
    // Revalida as páginas
    revalidatePath("/dashboard/documents")
    revalidatePath(`/dashboard/employees/${employeeId}`)
    
    return constructServerResponse({
      success: true,
      data: document,
      message: "Documento enviado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao enviar documento:", error)
    return constructServerResponse({
      success: false,
      error: `Não foi possível enviar o documento: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Server action para upload de documento usando FormData
 * Essa action é chamada diretamente pelo form action do formulário de upload
 * @param formData Dados do formulário de upload
 * @returns Resposta de sucesso ou erro
 */
export async function uploadDocumentAction(formData: FormData): Promise<ServerResponse> {
  try {
    return await uploadDocument(formData)
  } catch (error) {
    console.error("Erro no upload do documento:", error)
    return constructServerResponse({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload"
    })
  }
} 