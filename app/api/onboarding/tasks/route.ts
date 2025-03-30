/**
 * API para gerenciamento de tarefas de onboarding
 * @file app/api/onboarding/tasks/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingTaskCreateSchema } from "@/lib/schemas/onboarding-schema"

/**
 * GET - Obter lista de tarefas de onboarding
 * @param request Requisição
 * @returns Resposta com a lista de tarefas de onboarding
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    // Obtém o ID da empresa da query string
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get("companyId") || company.id
    
    // Verifica se o usuário tem acesso à empresa solicitada
    if (companyId !== company.id && !company.isAdmin) {
      return NextResponse.json(
        { error: { message: "Acesso negado a esta empresa" } },
        { status: 403 }
      )
    }
    
    // Obtém tarefas
    const tasks = await onboardingService.getTasks(companyId)
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Erro ao buscar tarefas de onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar tarefas de onboarding", details: error } },
      { status: 500 }
    )
  }
}

/**
 * POST - Criar nova tarefa de onboarding
 * @param request Requisição
 * @returns Resposta com a tarefa criada
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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
        { error: { message: "Apenas administradores podem criar tarefas" } },
        { status: 403 }
      )
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingTaskCreateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Dados inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Cria a tarefa
    const task = await onboardingService.createTask({
      ...validationResult.data,
      company_id: company.id  // Garante que a tarefa seja criada para a empresa do usuário
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error("Erro ao criar tarefa de onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao criar tarefa de onboarding", details: error } },
      { status: 500 }
    )
  }
} 