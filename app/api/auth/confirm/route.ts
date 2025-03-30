/**
 * API para confirmar email manualmente
 */
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Rota para confirmar email manualmente
 * Esta rota deve ser usada apenas em ambiente de desenvolvimento ou teste
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Cria o cliente Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Tenta fazer login diretamente
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error && error.message === "Email not confirmed") {
      // Tenta enviar um novo email de confirmação
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (resendError) {
        return NextResponse.json({ error: "Não foi possível enviar o email de confirmação" }, { status: 500 })
      }

      return NextResponse.json({
        message: "Email de confirmação enviado",
        needsConfirmation: true,
      })
    } else if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "Login realizado com sucesso",
      session: data.session,
    })
  } catch (error) {
    console.error("Erro ao confirmar email:", error)
    return NextResponse.json({ error: "Ocorreu um erro ao processar a solicitação" }, { status: 500 })
  }
}

