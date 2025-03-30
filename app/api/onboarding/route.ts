/**
 * API para gerenciamento de onboarding
 * @file app/api/onboarding/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingFiltersSchema } from "@/lib/schemas/onboarding-schema"
import { OnboardingFilters, OnboardingStatus } from "@/lib/types/onboarding"

/**
 * GET - Obter lista de onboardings
 * @param request Requisição
 * @returns Resposta com a lista de onboardings
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
    
    // Obtém parâmetros da query string
    const searchParams = request.nextUrl.searchParams
    const isAdmin = searchParams.get("isAdmin") === "true"
    const employeeId = searchParams.get("employeeId") || undefined
    
    // Constrói os filtros com base nos parâmetros
    const filters: OnboardingFilters = {}
    
    const status = searchParams.get("status") || undefined
    if (status && (status === "pending" || status === "completed")) {
      filters.status = status as OnboardingStatus
    }
    
    const filterEmployeeId = searchParams.get("filterEmployeeId") || undefined
    if (filterEmployeeId) {
      filters.employeeId = filterEmployeeId
    }
    
    const search = searchParams.get("search") || undefined
    if (search) {
      filters.search = search
    }
    
    // Valida os filtros
    const validationResult = onboardingFiltersSchema.safeParse(filters)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Filtros inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Se não for admin, só pode ver seus próprios onboardings
    if (!isAdmin && !employeeId) {
      return NextResponse.json(
        { error: { message: "ID do funcionário é obrigatório para usuários não administradores" } },
        { status: 400 }
      )
    }
    
    // Se for admin e não fornecer employeeId, usa o ID da empresa atual
    const companyId = company.id
    
    // Obtém a lista de onboardings
    const onboardings = await onboardingService.getOnboardings(
      companyId,
      isAdmin,
      employeeId,
      validationResult.data as OnboardingFilters
    )
    
    return NextResponse.json(onboardings)
  } catch (error) {
    console.error("Erro ao buscar onboardings:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao buscar onboardings", details: error } },
      { status: 500 }
    )
  }
} 