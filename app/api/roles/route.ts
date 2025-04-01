/**
 * API para gerenciamento de cargos
 * Implementa endpoints RESTful para listar e criar cargos
 */
import { NextRequest } from "next/server"
import { roleService } from "@/lib/services/role-service"
import { roleFormSchema } from "@/lib/schemas/role-schema"
import { successResponse, errorResponse, HttpStatus } from "@/lib/utils/api-response"
import { isAuthenticated, isAdmin } from "@/lib/auth-utils-server"

/**
 * GET - Lista todos os cargos
 * Retorna a lista de cargos disponíveis para a empresa atual
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    if (!(await isAuthenticated())) {
      return errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        message: "Usuário não autenticado",
        code: "auth/unauthorized",
      })
    }

    // Obtém o company_id da query string
    const url = new URL(req.url)
    const companyId = url.searchParams.get("company_id")

    if (!companyId) {
      return errorResponse({
        status: HttpStatus.BAD_REQUEST,
        message: "ID da empresa não fornecido",
        code: "validation/missing-company-id",
      })
    }

    // Busca os cargos no banco de dados
    const roles = await roleService.getRoles(companyId)

    // Retorna os cargos
    return successResponse({
      data: roles,
      message: "Cargos listados com sucesso",
    })
  } catch (error) {
    console.error("Erro ao listar cargos:", error)
    return errorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Erro ao listar cargos",
      code: "server/internal-error",
    })
  }
}

/**
 * POST - Cria um novo cargo
 * Recebe os dados do novo cargo e o persiste no banco de dados
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário é administrador
    if (!(await isAdmin())) {
      return errorResponse({
        status: HttpStatus.FORBIDDEN,
        message: "Apenas administradores podem criar cargos",
        code: "auth/forbidden",
      })
    }

    // Extrai os dados do corpo da requisição
    const data = await req.json()

    // Valida os dados usando o schema
    const validationResult = roleFormSchema.safeParse(data)

    if (!validationResult.success) {
      return errorResponse({
        status: HttpStatus.BAD_REQUEST,
        message: "Dados inválidos",
        code: "validation/invalid-data",
        details: validationResult.error.format(),
      })
    }

    // Cria o cargo no banco de dados
    const role = await roleService.createRole(validationResult.data)

    // Retorna o cargo criado
    return successResponse({
      data: role,
      message: "Cargo criado com sucesso",
      status: HttpStatus.CREATED,
    })
  } catch (error) {
    console.error("Erro ao criar cargo:", error)
    return errorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Erro ao criar cargo: ${error instanceof Error ? error.message : "Erro interno"}`,
      code: "server/internal-error",
    })
  }
}

/**
 * PUT, PATCH, DELETE - Não permitidos nesta rota
 * Para manipular um cargo específico, use /api/roles/[id]
 */
export function PUT() {
  return errorResponse({
    status: HttpStatus.METHOD_NOT_ALLOWED,
    message: "Método não permitido nesta rota. Use o endpoint específico do cargo para atualizações.",
    code: "method/not-allowed",
  })
}

export function PATCH() {
  return errorResponse({
    status: HttpStatus.METHOD_NOT_ALLOWED,
    message: "Método não permitido nesta rota. Use o endpoint específico do cargo para atualizações parciais.",
    code: "method/not-allowed",
  })
}

export function DELETE() {
  return errorResponse({
    status: HttpStatus.METHOD_NOT_ALLOWED,
    message: "Método não permitido nesta rota. Use o endpoint específico do cargo para exclusão.",
    code: "method/not-allowed",
  })
} 