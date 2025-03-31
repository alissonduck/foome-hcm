/**
 * API para gerenciamento de férias e ausências
 * Implementa rotas para listar e criar solicitações de férias e ausências
 */

import { NextRequest, NextResponse } from "next/server"
import { getTimeOffs, getTimeOff, createTimeOff, updateTimeOffStatus, deleteTimeOff } from "@/server/actions/time-off-actions"
import { timeOffCreateSchema } from "@/lib/schemas/time-off-schema"
import { getCurrentCompany } from "@/lib/auth-utils-server"

/**
 * Obtém todas as solicitações de férias e ausências do usuário ou da empresa
 * 
 * @param request Objeto de requisição
 * @returns Lista de solicitações de férias e ausências
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica se há um parâmetro de ID de funcionário
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")

    // Usa a server action para buscar os dados
    const timeOffs = await getTimeOffs(employeeId || null)
    
    return NextResponse.json(timeOffs)
  } catch (error) {
    console.error("[TIME_OFF_GET]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar solicitações de férias e ausências" },
      { status: 500 }
    )
  }
}

/**
 * Cria uma nova solicitação de férias ou ausência
 * 
 * @param request Objeto de requisição com dados da solicitação
 * @returns Solicitação criada
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém os dados da requisição
    const body = await request.json()

    // Valida os dados
    const validationResult = timeOffCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Usa a server action para criar a solicitação
    const timeOff = await createTimeOff({
      employee_id: body.employee_id,
      type: body.type,
      start_date: body.start_date,
      end_date: body.end_date,
      reason: body.reason,
      total_days: body.total_days
    })

    return NextResponse.json(timeOff)
  } catch (error) {
    console.error("[TIME_OFF_POST]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar solicitação de férias ou ausência" },
      { status: 500 }
    )
  }
} 