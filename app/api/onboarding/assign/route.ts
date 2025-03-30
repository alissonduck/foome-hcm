/**
 * API para atribuição de tarefas de onboarding
 * @file app/api/onboarding/assign/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { getCurrentCompany } from "@/lib/auth-utils-server"
import { createClient } from "@/lib/supabase/server"
import { onboardingService } from "@/lib/services/onboarding-service"
import { onboardingAssignSchema } from "@/lib/schemas/onboarding-schema"

/**
 * POST - Atribuir tarefas de onboarding a um funcionário
 * @param request Requisição
 * @returns Resposta com as tarefas atribuídas
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verifica se o usuário está autenticado
    const company = await getCurrentCompany()
    
    if (!company) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }
    
    // Obtém os dados do corpo da requisição
    const body = await request.json()
    
    // Valida os dados com o schema
    const validationResult = onboardingAssignSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { message: "Dados inválidos", details: validationResult.error.format() } },
        { status: 400 }
      )
    }
    
    const { employee_id, task_ids, notes, due_date } = validationResult.data
    
    // Verifica se o usuário tem permissão para atribuir tarefas ao funcionário
    // Se não for admin, só pode atribuir tarefas a si mesmo
    if (!company.isAdmin) {
      const supabase = await createClient()
      // Busca o ID do employee do usuário atual
      const { data: currentEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", company.userId)
        .single()
      
      if (!currentEmployee || currentEmployee.id !== employee_id) {
        return NextResponse.json(
          { error: { message: "Você só pode atribuir tarefas a si mesmo" } },
          { status: 403 }
        )
      }
    }
    
    // Verifica se o funcionário pertence à empresa do usuário
    const supabase = await createClient()
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, company_id")
      .eq("id", employee_id)
      .single()
    
    if (employeeError || !employee) {
      return NextResponse.json(
        { error: { message: "Funcionário não encontrado" } },
        { status: 404 }
      )
    }
    
    if (employee.company_id !== company.id) {
      return NextResponse.json(
        { error: { message: "Funcionário não pertence à sua empresa" } },
        { status: 403 }
      )
    }
    
    // Verifica se todas as tarefas pertencem à empresa do usuário
    const { data: tasks, error: tasksError } = await supabase
      .from("onboarding_tasks")
      .select("id, company_id")
      .in("id", task_ids)
    
    if (tasksError || !tasks || tasks.length !== task_ids.length) {
      return NextResponse.json(
        { error: { message: "Uma ou mais tarefas não foram encontradas" } },
        { status: 404 }
      )
    }
    
    const invalidTask = tasks.find(task => task.company_id !== company.id)
    if (invalidTask) {
      return NextResponse.json(
        { error: { message: "Uma ou mais tarefas não pertencem à sua empresa" } },
        { status: 403 }
      )
    }
    
    // Atribui as tarefas
    const onboardings = await onboardingService.assignTasks(
      employee_id,
      task_ids,
      notes,
      due_date
    )
    
    return NextResponse.json(onboardings)
  } catch (error) {
    console.error("Erro ao atribuir tarefas de onboarding:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao atribuir tarefas de onboarding", details: error } },
      { status: 500 }
    )
  }
} 