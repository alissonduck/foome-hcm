/**
 * API para atualização de status de funcionário
 * @file app/api/employees/[id]/status/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, getCurrentCompany } from "@/lib/auth-utils-server"
import { employeeService } from "@/lib/services/employee-service"
import { z } from "zod"

type RouteParams = {
  params: {
    id: string
  }
}

// Schema para validação de status
const statusSchema = z.object({
  status: z.enum(["active", "inactive", "on_leave", "terminated"], {
    required_error: "Status é obrigatório",
    invalid_type_error: "Status inválido",
  }),
})

/**
 * PATCH - Atualizar status do funcionário
 * @param request Requisição com status
 * @param params Parâmetros da rota
 * @returns Resposta com o funcionário atualizado
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Verifica se o usuário é administrador
    const isAdminUser = await isAdmin()
    
    if (!isAdminUser) {
      return NextResponse.json(
        { error: { message: "Apenas administradores podem atualizar o status de funcionários" } },
        { status: 403 }
      )
    }
    
    // Obtém empresa do usuário
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Empresa não encontrada" } },
        { status: 404 }
      )
    }
    
    const employeeId = params.id
    
    // Verifica se o funcionário existe
    const supabase = await createClient()
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employeeId)
      .single()
    
    if (!existingEmployee) {
      return NextResponse.json(
        { error: { message: "Funcionário não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    if (existingEmployee.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Acesso negado" } },
        { status: 403 }
      )
    }
    
    // Obtém status do body
    const body = await request.json()
    
    // Valida status
    const validationResult = statusSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Status inválido", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    // Atualiza status
    const updatedEmployee = await employeeService.updateEmployeeStatus(
      employeeId,
      validationResult.data.status
    )
    
    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Erro ao atualizar status do funcionário:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao atualizar status do funcionário", details: error } },
      { status: 500 }
    )
  }
} 