/**
 * API para operações em um cargo específico
 * Implementa endpoints RESTful para obter, atualizar e excluir um cargo específico
 */
import { NextRequest } from "next/server"
import { roleService } from "@/lib/services/role-service"
import { roleFormSchema } from "@/lib/schemas/role-schema"
import { successResponse, errorResponse, HttpStatus } from "@/lib/utils/api-response"
import { isAuthenticated, isAdmin } from "@/lib/auth-utils-server"

/**
 * GET - Obtém um cargo específico com seus detalhes
 * Retorna os dados completos de um cargo pelo seu ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verifica se o usuário está autenticado
    if (!(await isAuthenticated())) {
      return errorResponse({
        status: HttpStatus.UNAUTHORIZED,
        message: "Usuário não autenticado",
        code: "auth/unauthorized",
      })
    }

    // Aguarda a resolução dos parâmetros da rota
    const resolvedParams = await params
    const roleId = resolvedParams.id

    // Busca o cargo no banco de dados com todos os detalhes
    const role = await roleService.getRoleDetails(roleId)

    if (!role) {
      return errorResponse({
        status: HttpStatus.NOT_FOUND,
        message: "Cargo não encontrado",
        code: "role/not-found",
      })
    }

    // Retorna o cargo com seus detalhes
    return successResponse({
      data: role,
      message: "Cargo obtido com sucesso",
    })
  } catch (error) {
    console.error("Erro ao obter cargo:", error)
    return errorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Erro ao obter cargo",
      code: "server/internal-error",
    })
  }
}

/**
 * PUT - Atualiza completamente um cargo existente
 * Substitui todos os dados de um cargo pelo seu ID
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verifica se o usuário é administrador
    if (!(await isAdmin())) {
      return errorResponse({
        status: HttpStatus.FORBIDDEN,
        message: "Apenas administradores podem atualizar cargos",
        code: "auth/forbidden",
      })
    }

    // Aguarda a resolução dos parâmetros da rota
    const resolvedParams = await params
    const roleId = resolvedParams.id

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

    // Busca o cargo atual para verificar se existe
    try {
      await roleService.getRoleDetails(roleId)
    } catch (error) {
      return errorResponse({
        status: HttpStatus.NOT_FOUND,
        message: "Cargo não encontrado",
        code: "role/not-found",
      })
    }

    // Atualiza o cargo no banco de dados com todos os dados relacionados
    try {
      const role = await roleService.updateRole(roleId, validationResult.data)
      
      // Retorna o cargo atualizado
      return successResponse({
        data: role,
        message: "Cargo atualizado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error)
      return errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao atualizar cargo: ${error instanceof Error ? error.message : "Erro interno"}`,
        code: "server/update-error",
      })
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return errorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Erro ao processar requisição: ${error instanceof Error ? error.message : "Erro interno"}`,
      code: "server/internal-error",
    })
  }
}

/**
 * PATCH - Atualiza parcialmente um cargo existente
 * Permite modificar apenas alguns campos de um cargo pelo seu ID
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verifica se o usuário é administrador
    if (!(await isAdmin())) {
      return errorResponse({
        status: HttpStatus.FORBIDDEN,
        message: "Apenas administradores podem atualizar cargos",
        code: "auth/forbidden",
      })
    }

    // Aguarda a resolução dos parâmetros da rota
    const resolvedParams = await params
    const roleId = resolvedParams.id

    // Extrai os dados do corpo da requisição
    const data = await req.json()

    // Valida os dados usando o schema parcial (todos os campos são opcionais)
    const partialSchema = roleFormSchema.partial()
    const validationResult = partialSchema.safeParse(data)

    if (!validationResult.success) {
      return errorResponse({
        status: HttpStatus.BAD_REQUEST,
        message: "Dados inválidos",
        code: "validation/invalid-data",
        details: validationResult.error.format(),
      })
    }

    // Busca o cargo atual para verificar se existe
    try {
      await roleService.getRoleDetails(roleId)
    } catch (error) {
      return errorResponse({
        status: HttpStatus.NOT_FOUND,
        message: "Cargo não encontrado",
        code: "role/not-found",
      })
    }

    // Atualiza diretamente com os dados validados pelo schema
    // O roleService.updateRole já trata corretamente os campos relacionados
    try {
      const role = await roleService.updateRole(roleId, validationResult.data)
      
      // Retorna o cargo atualizado
      return successResponse({
        data: role,
        message: "Cargo atualizado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao atualizar cargo parcialmente:", error)
      return errorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao atualizar cargo: ${error instanceof Error ? error.message : "Erro interno"}`,
        code: "server/update-error",
      })
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return errorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Erro ao processar requisição: ${error instanceof Error ? error.message : "Erro interno"}`,
      code: "server/internal-error",
    })
  }
}

/**
 * DELETE - Remove um cargo existente
 * Exclui um cargo pelo seu ID
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verifica se o usuário é administrador
    if (!(await isAdmin())) {
      return errorResponse({
        status: HttpStatus.FORBIDDEN,
        message: "Apenas administradores podem excluir cargos",
        code: "auth/forbidden",
      })
    }

    // Aguarda a resolução dos parâmetros da rota
    const resolvedParams = await params
    const roleId = resolvedParams.id

    // Exclui o cargo do banco de dados
    const success = await roleService.deleteRole(roleId)

    if (!success) {
      return errorResponse({
        status: HttpStatus.NOT_FOUND,
        message: "Cargo não encontrado ou não pode ser excluído",
        code: "role/deletion-failed",
      })
    }

    // Retorna sucesso
    return successResponse({
      message: "Cargo excluído com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir cargo:", error)
    return errorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Erro ao excluir cargo: ${error instanceof Error ? error.message : "Erro interno"}`,
      code: "server/internal-error",
    })
  }
} 