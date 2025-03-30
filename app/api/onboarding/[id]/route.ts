/**
 * API para gerenciamento de um onboarding específico
 * @file app/api/onboarding/[id]/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"

interface Context {
  params: {
    id: string
  }
}

/**
 * GET - Obter um onboarding específico
 * @param request Requisição
 * @param context Contexto da requisição com o ID do onboarding
 * @returns Resposta com os dados do onboarding
 */
export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    // Extrai o ID do onboarding dos parâmetros
    const onboardingId = context.params.id
    
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    // Obtém o onboarding
    const onboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!onboarding) {
      return NextResponse.json(
        { error: { message: "Onboarding não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica se o onboarding pertence a um funcionário da empresa do usuário ou ao próprio usuário
    // Se não for admin, só pode ver seus próprios onboardings
    if (!company.isAdmin && onboarding.employee_id !== company.userId) {
      return NextResponse.json(
        { error: { message: "Acesso negado a este onboarding" } },
        { status: 403 }
      )
    }
    
    return NextResponse.json(onboarding)
  } catch (error) {
    console.error("Erro ao buscar onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar onboarding", details: error } },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Excluir um onboarding
 * @param request Requisição
 * @param context Contexto da requisição com o ID do onboarding
 * @returns Resposta com o resultado da exclusão
 */
export async function DELETE(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    // Extrai o ID do onboarding dos parâmetros
    const onboardingId = context.params.id
    
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
        { error: { message: "Apenas administradores podem excluir onboardings" } },
        { status: 403 }
      )
    }
    
    // Obtém o onboarding para verificar se existe
    const onboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!onboarding) {
      return NextResponse.json(
        { error: { message: "Onboarding não encontrado" } },
        { status: 404 }
      )
    }
    
    // Exclui o onboarding
    await onboardingService.deleteOnboarding(onboardingId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao excluir onboarding", details: error } },
      { status: 500 }
    )
  }
} 