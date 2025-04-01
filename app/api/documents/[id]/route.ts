/**
 * API para gerenciamento de documento específico
 * Implementa endpoints RESTful para um documento específico
 * @file app/api/documents/[id]/route.ts
 */

import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { documentService } from "@/lib/services/document-service"
import { documentUpdateSchema } from "@/lib/schemas/document-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { z } from "zod"

type RouteParams = {
  params: {
    id: string
  }
}

// Schema para PATCH (atualização parcial)
const documentPatchSchema = z.object({
  name: z.string().min(3).optional(),
  type: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  expiration_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização parcial"
})

/**
 * Função auxiliar para validar acesso ao documento
 */
async function validateDocumentAccess(documentId: string, requireAdmin = false) {
  // Verifica autenticação e permissões
  const company = await getCurrentCompany()
  
  if (!company) {
    return {
      success: false,
      error: {
        message: "Não autorizado",
        code: ErrorCodes.AUTHENTICATION_ERROR
      },
      status: HttpStatus.UNAUTHORIZED
    }
  }
  
  if (requireAdmin && !company.isAdmin) {
    return {
      success: false,
      error: {
        message: "Apenas administradores podem realizar esta operação",
        code: ErrorCodes.AUTHORIZATION_ERROR
      },
      status: HttpStatus.FORBIDDEN
    }
  }
  
  // Verifica se o documento existe
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("employee_documents")
    .select(`
      id, 
      employee_id,
      employees!employee_id (
        id,
        company_id,
        user_id
      )
    `)
    .eq("id", documentId)
    .single()
  
  if (error || !data) {
    return {
      success: false,
      error: {
        message: "Documento não encontrado",
        code: ErrorCodes.RESOURCE_NOT_FOUND
      },
      status: HttpStatus.NOT_FOUND
    }
  }
  
  // Verifica se o documento tem relação com funcionário
  const document = data as any
  
  if (!document.employees || !document.employees.company_id) {
    return {
      success: false,
      error: {
        message: "Documento sem informações de acesso",
        code: ErrorCodes.RESOURCE_NOT_FOUND
      },
      status: HttpStatus.NOT_FOUND
    }
  }
  
  // Verifica se o documento pertence à empresa do usuário
  if (document.employees.company_id !== company.id) {
    return {
      success: false,
      error: {
        message: "Acesso negado a este recurso",
        code: ErrorCodes.AUTHORIZATION_ERROR
      },
      status: HttpStatus.FORBIDDEN
    }
  }
  
  // Verifica se o usuário tem acesso ao documento (é admin ou dono do documento)
  const isOwnDocument = document.employees.user_id === company.userId
  
  if (!company.isAdmin && !isOwnDocument) {
    return {
      success: false,
      error: {
        message: "Sem permissão para acessar este documento",
        code: ErrorCodes.AUTHORIZATION_ERROR
      },
      status: HttpStatus.FORBIDDEN
    }
  }
  
  return { success: true, company, document }
}

/**
 * GET - Obter documento específico
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta com o documento
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const documentId = params.id
    
    // Valida acesso
    const validation = await validateDocumentAccess(documentId)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Obtém documento com detalhes
    const document = await documentService.getDocument(documentId)
    
    if (!document) {
      return errorResponse({
        error: {
          message: "Documento não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    return successResponse({
      data: document,
      message: "Documento encontrado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar documento:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar documento",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Atualizar documento (substituição completa)
 * @param request Requisição com dados do documento
 * @param params Parâmetros da rota
 * @returns Resposta com o documento atualizado
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const documentId = params.id
    
    // Valida acesso (requer admin)
    const validation = await validateDocumentAccess(documentId, true)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema
    const validationResult = documentUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse({
        error: {
          message: "Dados inválidos",
          details: validationResult.error.format(),
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
    
    // Atualiza documento
    const updatedDocument = await documentService.updateDocument(documentId, validationResult.data)
    
    return successResponse({
      data: updatedDocument,
      message: "Documento atualizado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar documento:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar documento",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PATCH - Atualizar documento parcialmente
 * @param request Requisição com dados parciais do documento
 * @param params Parâmetros da rota
 * @returns Resposta com o documento atualizado
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const documentId = params.id
    
    // Valida acesso (requer admin)
    const validation = await validateDocumentAccess(documentId, true)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema para PATCH
    const validationResult = documentPatchSchema.safeParse(body)
    
    if (!validationResult.success) {
      return errorResponse({
        error: {
          message: "Dados inválidos",
          details: validationResult.error.format(),
          code: ErrorCodes.VALIDATION_ERROR
        },
        status: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
    
    // Busca o documento atual primeiro
    const currentDocument = await documentService.getDocument(documentId)
    
    if (!currentDocument) {
      return errorResponse({
        error: {
          message: "Documento não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Mescla os dados atuais com as atualizações
    const updatedData = {
      ...validationResult.data,
      updated_at: new Date().toISOString()
    }
    
    // Atualiza documento
    const updatedDocument = await documentService.updateDocument(documentId, updatedData)
    
    return successResponse({
      data: updatedDocument,
      message: "Documento atualizado parcialmente com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar documento parcialmente:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar documento parcialmente",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * DELETE - Remover documento
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta de sucesso
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const documentId = params.id
    
    // Valida acesso (só admin ou o próprio dono do documento pode excluir)
    const validation = await validateDocumentAccess(documentId)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Remove documento
    const success = await documentService.deleteDocument(documentId)
    
    if (!success) {
      return errorResponse({
        error: {
          message: "Falha ao remover documento",
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
    
    return successResponse({
      message: "Documento removido com sucesso",
      status: HttpStatus.NO_CONTENT
    })
  } catch (error) {
    console.error("Erro ao remover documento:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao remover documento",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
} 