/**
 * API para gerenciamento de férias e ausências - Operações por ID
 * Implementa rotas para visualizar, atualizar e excluir solicitações específicas
 */

import { NextRequest, NextResponse } from "next/server"
import { getTimeOff, updateTimeOffStatus, deleteTimeOff } from "@/server/actions/time-off-actions"

/**
 * Obtém uma solicitação específica pelo ID
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota (contém o ID)
 * @returns Detalhes da solicitação
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const timeOff = await getTimeOff(params.id)
    return NextResponse.json(timeOff)
  } catch (error) {
    console.error("[TIME_OFF_GET_BY_ID]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar solicitação" },
      { status: 500 }
    )
  }
}

/**
 * Exclui uma solicitação pelo ID
 * 
 * @param request Objeto de requisição
 * @param params Parâmetros da rota (contém o ID)
 * @returns Confirmação de exclusão
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTimeOff(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TIME_OFF_DELETE]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir solicitação" },
      { status: 500 }
    )
  }
} 