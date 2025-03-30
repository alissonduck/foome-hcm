/**
 * API para gerenciamento de equipes
 * Implementa rotas para listar e criar equipes
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { TeamService } from "@/lib/services/team-service"
import { teamCreateSchema } from "@/lib/schemas/team-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { isAdmin } from "@/lib/permissions"

/**
 * Obtém todas as equipes da empresa atual
 * 
 * @param request Objeto de requisição
 * @returns Lista de equipes com informações básicas
 */
export async function GET(request: NextRequest) {
  try {
    // Obtém o cliente atual autenticado
    const company = await getCurrentCompany()

    if (!company) {
      return NextResponse.json(
        { error: "Não autenticado ou empresa não encontrada" },
        { status: 401 }
      )
    }

    // Obtém todas as equipes da empresa
    const teams = await TeamService.getTeams(company.id)

    return NextResponse.json(teams)
  } catch (error) {
    console.error("[TEAMS_GET]", error)
    return NextResponse.json(
      { error: "Erro ao buscar equipes" },
      { status: 500 }
    )
  }
}

/**
 * Cria uma nova equipe
 * 
 * @param request Objeto de requisição com dados da equipe
 * @returns Equipe criada
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém o cliente atual autenticado
    const company = await getCurrentCompany()

    if (!company) {
      return NextResponse.json(
        { error: "Não autenticado ou empresa não encontrada" },
        { status: 401 }
      )
    }

    // Verifica se o usuário é administrador
    const supabase = await createClient()
    const currentUser = await isAdmin(supabase, company.userId)

    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem criar equipes" },
        { status: 403 }
      )
    }

    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = teamCreateSchema.safeParse({
      ...body,
      company_id: company.id,
      created_by: company.userId,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Cria a equipe
    const team = await TeamService.createTeam(validationResult.data)

    return NextResponse.json(team)
  } catch (error) {
    console.error("[TEAMS_POST]", error)
    return NextResponse.json(
      { error: "Erro ao criar equipe" },
      { status: 500 }
    )
  }
} 