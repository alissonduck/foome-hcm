/**
 * API para gerenciamento de férias e ausências
 * Implementa endpoints RESTful para a coleção de solicitações de férias
 * @file app/api/time-off/route.ts
 */

import { NextRequest } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { TimeOffService } from "@/lib/services/time-off-service"
import { timeOffCreateSchema } from "@/lib/schemas/time-off-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { getTimeOffs } from "@/server/actions/time-off-actions"

/**
 * GET - Obtém lista de solicitações de férias e ausências com paginação e filtros
 * @param request Requisição com parâmetros de consulta
 * @returns Resposta com lista paginada de solicitações
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação e obtém dados da empresa
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
    
    // Obtém parâmetros de consulta
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get("employeeId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    
    // Usa a server action para buscar os dados
    const response = await getTimeOffs(employeeId || null)
    
    if (!response.success) {
      return errorResponse({
        error: {
          message: response.error || "Erro ao buscar solicitações",
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
    
    // Aplica filtros adicionais, se necessário
    let timeOffs = response.data
    if (status || type || search) {
      timeOffs = TimeOffService.filterTimeOffs(timeOffs, {
        status: status || undefined,
        type: type || undefined,
        search: search || undefined
      })
    }
    
    // Aplica paginação
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const startIndex = (page - 1) * pageSize
    const endIndex = page * pageSize
    const paginatedTimeOffs = timeOffs.slice(startIndex, endIndex)
    const totalItems = timeOffs.length
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return successResponse({
      data: paginatedTimeOffs,
      message: `${totalItems} solicitações encontradas`,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    })
  } catch (error) {
    console.error("[TIME_OFF_GET]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar solicitações de férias e ausências",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * POST - Cria uma nova solicitação de férias ou ausência
 * @param request Requisição com dados da solicitação
 * @returns Resposta com a solicitação criada
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação e obtém dados da empresa
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
    
    // Obtém os dados da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = timeOffCreateSchema.safeParse(body)
    
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
    
    // Cria a solicitação usando o serviço
    try {
      const timeOff = await TimeOffService.createTimeOff({
        employee_id: body.employee_id,
        type: body.type,
        start_date: body.start_date,
        end_date: body.end_date,
        reason: body.reason,
        total_days: body.total_days,
        status: "pending"
      })
      
      return successResponse({
        data: timeOff,
        message: "Solicitação de férias ou ausência criada com sucesso",
        status: HttpStatus.CREATED
      })
    } catch (error) {
      return errorResponse({
        error: {
          message: "Erro ao criar solicitação",
          details: error instanceof Error ? error.message : String(error),
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }
  } catch (error) {
    console.error("[TIME_OFF_POST]", error)
    
    return errorResponse({
      error: {
        message: "Erro ao criar solicitação de férias ou ausência",
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
export function PUT() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PUT em /api/time-off/[id] para atualizar uma solicitação específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * PATCH - Método não permitido na rota de coleção
 */
export function PATCH() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use PATCH em /api/time-off/[id] para atualizar parcialmente uma solicitação específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
}

/**
 * DELETE - Método não permitido na rota de coleção
 */
export function DELETE() {
  return errorResponse({
    error: {
      message: "Método não permitido. Use DELETE em /api/time-off/[id] para remover uma solicitação específica",
      code: ErrorCodes.VALIDATION_ERROR
    },
    status: HttpStatus.METHOD_NOT_ALLOWED
  })
} 