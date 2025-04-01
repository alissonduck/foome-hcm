/**
 * Serviço para gerenciamento de documentos
 * Fornece métodos para interagir com documentos de funcionários
 */

import { createClient } from "@/lib/supabase/server"
import type { 
  EmployeeDocument, 
  EmployeeDocumentInsert, 
  EmployeeDocumentUpdate, 
  DocumentWithEmployee,
  DocumentUploadResult,
  DocumentFilters,
  DocumentMetadata
} from "@/lib/types/documents"

export class documentService {
  /**
   * Obtém todos os documentos de um funcionário ou empresa
   * @param employeeId ID do funcionário (se null, busca documentos de toda a empresa)
   * @param companyId ID da empresa
   * @returns Lista de documentos
   */
  static async getDocuments(employeeId: string | null, companyId: string): Promise<DocumentWithEmployee[]> {
    try {
      if (!companyId) {
        console.warn("ID da empresa não fornecido")
        return []
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
          .eq("company_id", companyId)
        
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
      
      return data as unknown as DocumentWithEmployee[]
    } catch (error) {
      console.error("Erro ao buscar documentos:", error)
      throw new Error(`Não foi possível buscar os documentos: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Obtém um documento específico
   * @param documentId ID do documento
   * @returns Documento
   */
  static async getDocument(documentId: string): Promise<DocumentWithEmployee> {
    try {
      if (!documentId) {
        throw new Error("ID do documento não fornecido")
      }

      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employee_documents")
        .select(`
          *,
          employees:employee_id (
            id, 
            full_name,
            email
          )
        `)
        .eq("id", documentId)
        .single()
      
      if (error) {
        console.error("Erro na consulta:", error)
        throw error
      }
      
      return data as unknown as DocumentWithEmployee
    } catch (error) {
      console.error("Erro ao buscar documento:", error)
      throw new Error(`Não foi possível buscar o documento: ${JSON.stringify(error)}`)
    }
  }
  
  /**
   * Verifica se um usuário tem acesso a um documento
   * @param documentId ID do documento
   * @param userId ID do usuário
   * @param isAdmin Se o usuário é administrador
   * @returns Verdadeiro se o usuário tem acesso
   */
  static async checkDocumentAccess(documentId: string, userId: string, isAdmin: boolean): Promise<boolean> {
    try {
      // Administradores sempre têm acesso
      if (isAdmin) {
        return true
      }
      
      const supabase = await createClient()
      
      // Obtém o documento com o ID do funcionário
      const { data: document, error: documentError } = await supabase
        .from("employee_documents")
        .select("employee_id")
        .eq("id", documentId)
        .single()
      
      if (documentError || !document) {
        return false
      }
      
      // Verifica se o usuário é o dono do documento
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", userId)
        .eq("id", document.employee_id)
        .single()
      
      // Se encontrou o funcionário, significa que o usuário é o dono do documento
      return !employeeError && !!employee
    } catch (error) {
      console.error("Erro ao verificar acesso ao documento:", error)
      return false
    }
  }
  
  /**
   * Cria um novo documento
   * @param document Dados do documento
   * @returns Documento criado
   */
  static async createDocument(document: EmployeeDocumentInsert): Promise<EmployeeDocument> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employee_documents")
        .insert(document)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao criar documento:", error)
      throw new Error("Não foi possível criar o documento")
    }
  }
  
  /**
   * Atualiza um documento existente
   * @param id ID do documento
   * @param document Dados atualizados do documento
   * @returns Documento atualizado
   */
  static async updateDocument(id: string, document: EmployeeDocumentUpdate): Promise<EmployeeDocument> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employee_documents")
        .update(document)
        .eq("id", id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar documento:", error)
      throw new Error("Não foi possível atualizar o documento")
    }
  }
  
  /**
   * Atualiza o status de um documento
   * @param id ID do documento
   * @param status Novo status
   * @returns Documento atualizado
   */
  static async updateDocumentStatus(id: string, status: string): Promise<EmployeeDocument> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from("employee_documents")
        .update({ status })
        .eq("id", id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao atualizar status do documento:", error)
      throw new Error("Não foi possível atualizar o status do documento")
    }
  }
  
  /**
   * Remove um documento
   * @param id ID do documento
   * @returns Verdadeiro se a remoção for bem-sucedida
   */
  static async deleteDocument(id: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      // Primeiro obtém o caminho do arquivo para excluir do storage
      const { data: document, error: fetchError } = await supabase
        .from("employee_documents")
        .select("file_path")
        .eq("id", id)
        .single()
      
      if (fetchError) {
        throw fetchError
      }
      
      // Exclui o registro do banco de dados
      const { error: deleteError } = await supabase
        .from("employee_documents")
        .delete()
        .eq("id", id)
      
      if (deleteError) {
        throw deleteError
      }
      
      // Se o documento tem um arquivo associado, exclui do storage
      if (document?.file_path) {
        const { error: storageError } = await supabase
          .storage
          .from("documents")
          .remove([document.file_path])
        
        if (storageError) {
          console.error("Erro ao excluir arquivo do storage:", storageError)
        }
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir documento:", error)
      throw new Error("Não foi possível excluir o documento")
    }
  }
  
  /**
   * Faz upload de um arquivo para o storage
   * @param employeeId ID do funcionário
   * @param file Arquivo a ser enviado
   * @returns Resultado do upload
   */
  static async uploadFile(employeeId: string, file: File): Promise<DocumentUploadResult> {
    try {
      const supabase = await createClient()
      
      // Gera um nome único para o arquivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${employeeId}/${fileName}`
      
      // Faz o upload do arquivo
      const { error } = await supabase
        .storage
        .from("documents")
        .upload(filePath, file)
      
      if (error) {
        throw error
      }
      
      return {
        filePath,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    } catch (error) {
      console.error("Erro ao fazer upload de arquivo:", error)
      throw new Error("Não foi possível fazer o upload do arquivo")
    }
  }
  
  /**
   * Obtém a URL assinada para download de um arquivo
   * @param filePath Caminho do arquivo no storage
   * @param expiresIn Tempo de expiração em segundos (padrão: 60)
   * @returns URL assinada
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 60): Promise<string> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .storage
        .from("documents")
        .createSignedUrl(filePath, expiresIn)
      
      if (error) {
        throw error
      }
      
      return data.signedUrl
    } catch (error) {
      console.error("Erro ao obter URL assinada:", error)
      throw new Error("Não foi possível obter a URL do arquivo")
    }
  }
  
  /**
   * Baixa um arquivo do storage
   * @param filePath Caminho do arquivo no storage
   * @returns Blob do arquivo
   */
  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .storage
        .from("documents")
        .download(filePath)
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error)
      throw new Error("Não foi possível baixar o arquivo")
    }
  }
  
  /**
   * Obtém os metadados de um arquivo
   * @param filePath Caminho do arquivo no storage
   * @returns Metadados do arquivo
   */
  static async getFileMetadata(filePath: string): Promise<DocumentMetadata> {
    try {
      const supabase = await createClient()
      
      const { data } = await supabase
        .storage
        .from("documents")
        .getPublicUrl(filePath)
      
      if (!data) {
        throw new Error("Não foi possível obter a URL pública do arquivo")
      }
      
      // Faz uma requisição HEAD para obter os metadados
      const response = await fetch(data.publicUrl, { method: "HEAD" })
      
      return {
        contentType: response.headers.get("content-type") || "",
        size: parseInt(response.headers.get("content-length") || "0"),
        lastModified: response.headers.get("last-modified") || undefined,
        cacheControl: response.headers.get("cache-control") || undefined
      }
    } catch (error) {
      console.error("Erro ao obter metadados do arquivo:", error)
      throw new Error("Não foi possível obter os metadados do arquivo")
    }
  }
  
  /**
   * Filtra documentos com base em critérios
   * @param documents Lista de documentos
   * @param filters Filtros a serem aplicados
   * @returns Lista filtrada de documentos
   */
  static filterDocuments(documents: DocumentWithEmployee[], filters: DocumentFilters): DocumentWithEmployee[] {
    return documents.filter(doc => {
      // Filtro por funcionário
      if (filters.employeeId && filters.employeeId !== "all" && doc.employee_id !== filters.employeeId) {
        return false
      }
      
      // Filtro por status
      if (filters.status && filters.status !== "all" && doc.status !== filters.status) {
        return false
      }
      
      // Filtro por busca (nome, tipo ou nome do funcionário)
      if (filters.search) {
        const query = filters.search.toLowerCase()
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query) ||
          (doc.employees?.full_name && doc.employees.full_name.toLowerCase().includes(query))
        )
      }
      
      return true
    })
  }
} 