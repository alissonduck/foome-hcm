"use server"

import { revalidatePath } from "next/cache"
import { uploadDocument } from "@/server/actions/document-actions"

/**
 * Server action para upload de documento usando FormData
 * Essa action é chamada diretamente pelo form action do formulário de upload
 */
export async function uploadDocumentAction(formData: FormData) {
  try {
    return await uploadDocument(formData)
  } catch (error) {
    console.error("Erro no upload do documento:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload" 
    }
  }
} 