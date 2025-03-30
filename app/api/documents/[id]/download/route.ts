/**
 * API para download de documentos
 * @file app/api/documents/[id]/download/route.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAuthenticated } from "@/lib/auth-utils-server"
import { documentService } from "@/lib/services/document-service" 

type RouteParams = {
  params: {
    id: string
  }
}

/**
 * GET - Obter URL assinada para download do documento
 * @param request Requisição
 * @param params Parâmetros da rota
 * @returns Resposta com a URL para download
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Verifica autenticação
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: { message: "Não autorizado" } },
        { status: 401 }
      )
    }

    const documentId = params.id
    
    // Busca o documento
    const supabase = await createClient()
    const document = await documentService.getDocument(documentId)
    
    if (!document) {
      return NextResponse.json(
        { error: { message: "Documento não encontrado" } },
        { status: 404 }
      )
    }
    
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: { message: "Usuário não encontrado" } },
        { status: 404 }
      )
    }
    
    // Verifica permissão (apenas admin ou dono do documento pode acessar)
    const { data: employee } = await supabase
      .from("employees")
      .select("id, is_admin, company_id")
      .eq("user_id", user.id)
      .single()
    
    if (!employee) {
      return NextResponse.json(
        { error: { message: "Funcionário não encontrado" } },
        { status: 404 }
      )
    }
    
    const isOwnDocument = document.employee_id === employee.id
    const isAdmin = employee.is_admin
    
    if (!isOwnDocument && !isAdmin) {
      return NextResponse.json(
        { error: { message: "Acesso negado" } },
        { status: 403 }
      )
    }
    
    // Verifica se o arquivo existe
    if (!document.file_path) {
      return NextResponse.json(
        { error: { message: "Arquivo não encontrado" } },
        { status: 404 }
      )
    }
    
    // Gera URL assinada para download
    const { data, error } = await supabase
      .storage
      .from("documents")
      .createSignedUrl(document.file_path, 60) // URL válida por 60 segundos
    
    if (error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error("Erro ao obter documento:", error)
    
    return NextResponse.json(
      { error: { message: "Erro ao processar a solicitação" } },
      { status: 500 }
    )
  }
} 