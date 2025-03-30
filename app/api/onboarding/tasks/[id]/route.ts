/**
 * API para gerenciamento de uma tarefa de onboarding específica
 * @file app/api/onboarding/tasks/[id]/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingTaskUpdateSchema } from "@/lib/schemas/onboarding-schema"

interface Context {
  params: {
    id: string
  }
}

/**
 * GET - Obter uma tarefa de onboarding
 * @param request Requisição
 * @param context Contexto da requisição com o ID da tarefa
 * @returns Resposta com os dados da tarefa
 */
export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    // Obtém a tarefa
    const task = await onboardingService.getTask(taskId)
    
    if (!task) {
      return NextResponse.json(
        { error: { message: "Tarefa não encontrada" } },
        { status: 404 }
      )
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (task.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Acesso negado a esta tarefa" } },
        { status: 403 }
      )
    }
    
    return NextResponse.json(task)
  } catch (error) {
    console.error("Erro ao buscar tarefa de onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar tarefa de onboarding", details: error } },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar uma tarefa de onboarding
 * @param request Requisição
 * @param context Contexto da requisição com o ID da tarefa
 * @returns Resposta com os dados da tarefa atualizada
 */
export async function PUT(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
    // Verifica se o usuário está autenticado e é administrador
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    if (!company.isAdmin) {
      return NextResponse.json(
        { error: { message: "Apenas administradores podem atualizar tarefas" } },
        { status: 403 }
      )
    }
    
    // Obtém a tarefa existente para verificar a propriedade
    const existingTask = await onboardingService.getTask(taskId)
    
    if (!existingTask) {
      return NextResponse.json(
        { error: { message: "Tarefa não encontrada" } },
        { status: 404 }
      )
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (existingTask.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Acesso negado a esta tarefa" } },
        { status: 403 }
      )
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingTaskUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Dados inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Atualiza a tarefa
    const task = await onboardingService.updateTask(taskId, {
      ...validationResult.data,
      company_id: company.id  // Garante que a empresa não seja alterada
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error("Erro ao atualizar tarefa de onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao atualizar tarefa de onboarding", details: error } },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Excluir uma tarefa de onboarding
 * @param request Requisição
 * @param context Contexto da requisição com o ID da tarefa
 * @returns Resposta com o resultado da exclusão
 */
export async function DELETE(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    // Extrai o ID da tarefa dos parâmetros
    const taskId = context.params.id
    
    // Verifica se o usuário está autenticado e é administrador
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    if (!company.isAdmin) {
      return NextResponse.json(
        { error: { message: "Apenas administradores podem excluir tarefas" } },
        { status: 403 }
      )
    }
    
    // Obtém a tarefa existente para verificar a propriedade
    const existingTask = await onboardingService.getTask(taskId)
    
    if (!existingTask) {
      return NextResponse.json(
        { error: { message: "Tarefa não encontrada" } },
        { status: 404 }
      )
    }
    
    // Verifica se a tarefa pertence à empresa do usuário
    if (existingTask.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Acesso negado a esta tarefa" } },
        { status: 403 }
      )
    }
    
    // Exclui a tarefa
    await onboardingService.deleteTask(taskId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir tarefa de onboarding:", error)
    
    // Se for um erro específico de uso de tarefa
    if (error instanceof Error && error.message.includes("não pode ser excluída")) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: { message: "Erro ao excluir tarefa de onboarding", details: error } },
      { status: 500 }
    )
  }
} 