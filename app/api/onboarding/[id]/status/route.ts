/**
 * API para atualização de status de um onboarding
 * @file app/api/onboarding/[id]/status/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { createClient } from "@/lib/supabase/server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingStatusUpdateSchema } from "@/lib/schemas/onboarding-schema"

interface Context {
  params: {
    id: string
  }
}

/**
 * PATCH - Atualizar o status de um onboarding
 * @param request Requisição
 * @param context Contexto da requisição com o ID do onboarding
 * @returns Resposta com os dados do onboarding atualizado
 */
export async function PATCH(
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
    
    // Obtém o onboarding existente
    const existingOnboarding = await onboardingService.getOnboarding(onboardingId)
    
    if (!existingOnboarding) {
      return NextResponse.json(
        { error: { message: "Onboarding não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica se o usuário tem permissão para atualizar o onboarding
    // Se não for admin, só pode atualizar seus próprios onboardings
    if (!company.isAdmin && existingOnboarding.employee_id !== company.userId) {
      return NextResponse.json(
        { error: { message: "Acesso negado a este onboarding" } },
        { status: 403 }
      )
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingStatusUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Dados inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Atualiza o status do onboarding
    const { status, completed_by, notes } = validationResult.data
    
    // Se for atualizar para "completed", adiciona o ID do usuário como completado_por,
    // se não for fornecido
    let completedById = completed_by || undefined
    if (status === "completed" && !completedById) {
      // Busca o ID do employee pelo userId
      const supabase = await createClient()
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", company.userId)
        .single()
      
      if (employee) {
        completedById = employee.id
      }
    }
    
    const updatedOnboarding = await onboardingService.updateStatus(
      onboardingId,
      status,
      completedById,
      notes || undefined
    )
    
    return NextResponse.json(updatedOnboarding)
  } catch (error) {
    console.error("Erro ao atualizar status do onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao atualizar status do onboarding", details: error } },
      { status: 500 }
    )
  }
} 