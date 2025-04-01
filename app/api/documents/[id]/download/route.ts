/**
 * API para download de documentos
 * Implementa endpoint para obter URL assinada para download de documento
 * @file app/api/documents/[id]/download/route.ts
 */

import { NextRequest } from "next/server"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { getSignedUrl } from "@/server/actions/document-actions"
import { documentService } from "@/lib/services/document-service"
import { getCurrentCompany } from "@/lib/auth-utils-server"

type RouteParams = {
  params: {
    id: string
  }
}

/**
 * GET - Obter URL assinada para download do documento
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta com a URL para download
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verifica autenticação
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

    const documentId = params.id
    
    // Busca o documento usando o serviço
    try {
      const document = await documentService.getDocument(documentId)
      
      // Verifica se o documento existe
      if (!document || !document.file_path) {
        return errorResponse({
          error: {
            message: "Documento ou arquivo não encontrado",
            code: ErrorCodes.RESOURCE_NOT_FOUND
          },
          status: HttpStatus.NOT_FOUND
        })
      }
      
      // Verifica permissão (apenas admin ou dono do documento pode acessar)
      const hasAccess = await documentService.checkDocumentAccess(documentId, company.userId, company.isAdmin)
      
      if (!hasAccess) {
        return errorResponse({
          error: {
            message: "Acesso negado a este documento",
            code: ErrorCodes.AUTHORIZATION_ERROR
          },
          status: HttpStatus.FORBIDDEN
        })
      }
      
      // Usa a server action para gerar a URL assinada
      const response = await getSignedUrl(document.file_path, 60)
      
      if (!response.success) {
        return errorResponse({
          error: {
            message: "Erro ao gerar URL de download",
            details: response.error,
            code: ErrorCodes.INTERNAL_ERROR
          },
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      }
      
      return successResponse({
        data: { url: response.data?.url },
        message: "URL de download gerada com sucesso"
      })
    } catch (error) {
      console.error("Erro ao processar documento:", error)
      
      return errorResponse({
        error: {
          message: "Erro ao processar solicitação de download",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("Erro ao processar solicitação de download:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao processar solicitação de download",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST, PUT, PATCH, DELETE - Métodos não suportados
 */
export function POST() {
  return errorResponse({
    error: {
      message: "Método não suportado nesta rota. Use GET para obter URL de download.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

export function PUT() {
  return errorResponse({
    error: {
      message: "Método não suportado nesta rota. Use GET para obter URL de download.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

export function PATCH() {
  return errorResponse({
    error: {
      message: "Método não suportado nesta rota. Use GET para obter URL de download.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não suportado nesta rota. Use GET para obter URL de download.",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 