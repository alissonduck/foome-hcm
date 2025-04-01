/**
 * API para gerenciamento de documentos
 * Implementa endpoints RESTful para a coleção de documentos
 * @file app/api/documents/route.ts
 */

import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { documentService } from "@/lib/services/document-service"
import { documentUploadSchema } from "@/lib/schemas/document-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { EmployeeDocumentInsert } from "@/lib/types/documents"

/**
 * GET - Obter lista de documentos com paginação e filtros
 * @param request Requisição com parâmetros de consulta
 * @returns Resposta com lista paginada de documentos
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return errorResponse({
        error: {
          message: "Não autorizado",
          code: ErrorCodes.AUTHENTICATION_ERROR
        },
        status: HttpStatus.UNAUTHORIZED
      })
    }
    
    // Obtém parâmetros de paginação, filtro e ordenação
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get("employeeId") || null
    const status = searchParams.get("status") || null
    const search = searchParams.get("search") || null
    
    // Obtém documentos com filtros
    const documents = await documentService.getDocuments(employeeId, company.id)
    
    // Aplica filtros, se houver
    let filteredDocuments = documents
    if (status || search) {
      filteredDocuments = documentService.filterDocuments(documents, {
        status: status as any,
        search: search || undefined
      })
    }
    
    // Aplica paginação
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const startIndex = (page - 1) * pageSize
    const endIndex = page * pageSize
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)
    const totalItems = filteredDocuments.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return successResponse({
      data: paginatedDocuments,
      message: `${totalItems} documentos encontrados`,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    })
  } catch (error) {
    console.error("Erro ao buscar documentos:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar documentos",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Criar novo documento
 * @param request Requisição com dados do documento
 * @returns Resposta com o documento criado
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return errorResponse({
        error: {
          message: "Não autorizado",
          code: ErrorCodes.AUTHENTICATION_ERROR
        },
        status: HttpStatus.UNAUTHORIZED
      })
    }
    
    // Para o upload de arquivos, é necessário usar FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const employeeId = formData.get("employeeId") as string
    const expirationDate = formData.get("expirationDate") as string | null
    
    // Valida dados com schema
    const validationResult = documentUploadSchema.safeParse({
      name,
      type,
      employeeId,
      expirationDate: expirationDate || undefined,
      file
    })
    
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
    
    // Verifica se o funcionário pertence à empresa
    const supabase = await createClient()
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id, user_id")
      .eq("id", employeeId)
      .single()
    
    if (employeeError || !employee) {
      return errorResponse({
        error: {
          message: "Funcionário não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    if (employee.company_id !== company.id) {
      return errorResponse({
        error: {
          message: "Funcionário não pertence à sua empresa",
          code: ErrorCodes.AUTHORIZATION_ERROR
        },
        status: HttpStatus.FORBIDDEN
      })
    }
    
    // Gera um nome único para o arquivo
    const timestamp = new Date().getTime()
    const fileExt = file!.name.split(".").pop()
    const fileName = `${employeeId}/${type}_${timestamp}.${fileExt}`
    
    // Faz upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("documents")
      .upload(fileName, file!, {
        cacheControl: "3600",
        upsert: false
      })
    
    if (uploadError) {
      return errorResponse({
        error: {
          message: "Erro ao fazer upload do arquivo",
          details: uploadError.message,
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
    
    // Cria o documento no banco de dados
    const documentData: EmployeeDocumentInsert = {
      employee_id: employeeId,
      name: name,
      type: type,
      file_name: file!.name,
      file_path: `documents/${fileName}`,
      file_size: file!.size,
      file_type: file!.type,
      status: "pending",
      uploaded_by: company.userId,
      expiration_date: expirationDate || null
    }
    
    const document = await documentService.createDocument(documentData)
    
    return successResponse({
      data: document,
      message: "Documento criado com sucesso",
      status: HttpStatus.CREATED
    })
  } catch (error) {
    console.error("Erro ao criar documento:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao criar documento",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Método não permitido na rota de coleção
 */
export async function PUT() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PUT em /api/documents/[id] para atualizar um documento específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PATCH - Método não permitido na rota de coleção
 */
export async function PATCH() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PATCH em /api/documents/[id] para atualizar parcialmente um documento específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * DELETE - Método não permitido na rota de coleção
 */
export async function DELETE() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use DELETE em /api/documents/[id] para remover um documento específico",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 