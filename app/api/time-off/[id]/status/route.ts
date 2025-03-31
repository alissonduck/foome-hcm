/**
 * API para atualizar o status de uma solicitação de férias e ausências
 */

import { NextRequest, NextResponse } from "next/server"
import { updateTimeOffStatus } from "@/server/actions/time-off-actions"

/**
 * Atualiza o status de uma solicitação
 * 
 * @param request Objeto de requisição com os dados do status
 * @param params Parâmetros da rota (contém o ID)
 * @returns Solicitação atualizada
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Verifica se o status foi fornecido
    if (!body.status) {
      return NextResponse.json(
        { error: "O status é obrigatório" },
        { status: 400 }
      )
    }
    
    // Verifica se o status é válido
    if (!["pending", "approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "Status inválido. Valores permitidos: pending, approved, rejected" },
        { status: 400 }
      )
    }

    // Atualiza o status usando a server action
    const updatedTimeOff = await updateTimeOffStatus(params.id, body.status)
    
    return NextResponse.json(updatedTimeOff)
  } catch (error) {
    console.error("[TIME_OFF_UPDATE_STATUS]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar status da solicitação" },
      { status: 500 }
    )
  }
} 