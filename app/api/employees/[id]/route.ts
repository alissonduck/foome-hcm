/**
 * API para gerenciamento de funcionário específico
 * Implementa endpoints RESTful para um item específico
 * @file app/api/employees/[id]/route.ts
 */

import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeService } from "@/lib/services/employee-service"
import { employeeUpdateSchema } from "@/lib/schemas/employee-schema"
import { successResponse, errorResponse, HttpStatus, ErrorCodes } from "@/lib/utils/api-response"
import { z } from "zod"

type RouteParams = {
  params: {
    id: string
  }
}

// Schema para PATCH (atualização parcial)
const employeePatchSchema = z.object({
  full_name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
  contract_type: z.string().optional(),
  hire_date: z.string().optional(),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
  updated_at: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização parcial"
})

/**
 * Função auxiliar para validar acesso ao funcionário
 */
async function validateEmployeeAccess(employeeId: string, requireAdmin = false) {
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
  
  // Verifica se o funcionário existe
  const supabase = await createClient()
  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, company_id")
    .eq("id", employeeId)
    .single()
  
  if (error || !employee) {
    return {
      success: false,
      error: {
        message: "Funcionário não encontrado",
        code: ErrorCodes.RESOURCE_NOT_FOUND
      },
      status: HttpStatus.NOT_FOUND
    }
  }
  
  // Verifica se o funcionário pertence à empresa do usuário
  if (employee.company_id !== company.id) {
    return {
      success: false,
      error: {
        message: "Acesso negado a este recurso",
        code: ErrorCodes.AUTHORIZATION_ERROR
      },
      status: HttpStatus.FORBIDDEN
    }
  }
  
  return { success: true, company }
}

/**
 * GET - Obter funcionário específico
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta com o funcionário
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const employeeId = params.id
    
    // Valida acesso
    const validation = await validateEmployeeAccess(employeeId)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Obtém funcionário com detalhes
    const employee = await employeeService.getEmployee(employeeId)
    
    if (!employee) {
      return errorResponse({
        error: {
          message: "Funcionário não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    return successResponse({
      data: employee,
      message: "Funcionário encontrado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao buscar funcionário",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PUT - Atualizar funcionário (substituição completa)
 * @param request Requisição com dados do funcionário
 * @param params Parâmetros da rota
 * @returns Resposta com o funcionário atualizado
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const employeeId = params.id
    
    // Valida acesso (requer admin)
    const validation = await validateEmployeeAccess(employeeId, true)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema
    const validationResult = employeeUpdateSchema.safeParse(body)
    
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
    
    // Atualiza funcionário
    const updatedEmployee = await employeeService.updateEmployee(employeeId, validationResult.data)
    
    return successResponse({
      data: updatedEmployee,
      message: "Funcionário atualizado com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar funcionário",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * PATCH - Atualizar funcionário parcialmente
 * @param request Requisição com dados parciais do funcionário
 * @param params Parâmetros da rota
 * @returns Resposta com o funcionário atualizado
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const employeeId = params.id
    
    // Valida acesso (requer admin)
    const validation = await validateEmployeeAccess(employeeId, true)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Obtém dados do body
    const body = await request.json()
    
    // Valida dados com schema para PATCH
    const validationResult = employeePatchSchema.safeParse(body)
    
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
    
    // Busca o funcionário atual primeiro
    const currentEmployee = await employeeService.getEmployee(employeeId)
    
    if (!currentEmployee) {
      return errorResponse({
        error: {
          message: "Funcionário não encontrado",
          code: ErrorCodes.RESOURCE_NOT_FOUND
        },
        status: HttpStatus.NOT_FOUND
      })
    }
    
    // Mescla os dados atuais com as atualizações
    const updatedData = {
      ...currentEmployee,
      ...validationResult.data,
      updated_at: new Date().toISOString()
    }
    
    // Atualiza funcionário
    const updatedEmployee = await employeeService.updateEmployee(employeeId, updatedData)
    
    return successResponse({
      data: updatedEmployee,
      message: "Funcionário atualizado parcialmente com sucesso"
    })
  } catch (error) {
    console.error("Erro ao atualizar funcionário parcialmente:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao atualizar funcionário parcialmente",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

/**
 * DELETE - Remover funcionário
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta de sucesso
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const employeeId = params.id
    
    // Valida acesso (requer admin)
    const validation = await validateEmployeeAccess(employeeId, true)
    if (!validation.success) {
      return errorResponse({
        error: validation.error,
        status: validation.status
      })
    }
    
    // Remove funcionário
    await employeeService.deleteEmployee(employeeId)
    
    return successResponse({
      message: "Funcionário removido com sucesso",
      status: HttpStatus.NO_CONTENT
    })
  } catch (error) {
    console.error("Erro ao remover funcionário:", error)
    
    return errorResponse({
      error: {
        message: "Erro ao remover funcionário",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCodes.INTERNAL_ERROR
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
} 