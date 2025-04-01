"use server"

import { PhotoService } from "@/lib/services/photo-service"
import { EmployeePhotoInsert, PhotoUploadData } from "@/lib/types/photo"
import { constructServerResponse, ServerResponse } from "@/lib/utils/server-response"
import { revalidatePath } from "next/cache"
import { validateUserCompanyAccess } from "../utils/validators"

/**
 * Server action para obter a foto de um funcionário
 * @param employeeId ID do funcionário
 * @returns Photo do funcionário ou null
 */
export async function getEmployeePhoto(employeeId: string): Promise<ServerResponse> {
  try {
    const service = new PhotoService()
    const photo = await service.getEmployeePhoto(employeeId)
    
    return constructServerResponse({
      data: photo,
      success: true,
      message: "Foto do funcionário obtida com sucesso"
    })
  } catch (error) {
    console.error("Erro ao obter foto do funcionário:", error)
    return constructServerResponse({
      error: error instanceof Error ? error.message : "Erro ao obter foto do funcionário",
      success: false
    })
  }
}

/**
 * Server action para criar ou atualizar a foto de um funcionário
 * @param photo Dados da foto
 * @returns Foto criada ou atualizada
 */
export async function upsertEmployeePhoto(photo: EmployeePhotoInsert): Promise<ServerResponse> {
  try {
    // Validar acesso da empresa
    const validationResult = await validateUserCompanyAccess(photo.employee_id);
    if (!validationResult.success) {
      return constructServerResponse({
        error: validationResult.error,
        success: false
      });
    }
    
    const service = new PhotoService()
    const createdPhoto = await service.upsertEmployeePhoto(photo)
    
    revalidatePath("/employees/[id]", "page")
    revalidatePath("/employees", "page")
    
    return constructServerResponse({
      data: createdPhoto,
      success: true,
      message: "Foto do funcionário salva com sucesso"
    })
  } catch (error) {
    console.error("Erro ao salvar foto do funcionário:", error)
    return constructServerResponse({
      error: error instanceof Error ? error.message : "Erro ao salvar foto do funcionário",
      success: false
    })
  }
}

/**
 * Server action para remover a foto de um funcionário
 * @param employeeId ID do funcionário
 * @returns Status da operação
 */
export async function deleteEmployeePhoto(employeeId: string): Promise<ServerResponse> {
  try {
    // Validar acesso da empresa
    const validationResult = await validateUserCompanyAccess(employeeId);
    if (!validationResult.success) {
      return constructServerResponse({
        error: validationResult.error,
        success: false
      });
    }
    
    const service = new PhotoService()
    
    // Obter a foto atual para verificar se há uma imagem no storage para deletar
    const currentPhoto = await service.getEmployeePhoto(employeeId)
    
    if (currentPhoto?.admission_photo) {
      // Deletar a imagem do storage
      await service.deletePhotoFromStorage(currentPhoto.admission_photo)
    }
    
    // Deletar o registro da foto
    await service.deleteEmployeePhoto(employeeId)
    
    revalidatePath("/employees/[id]", "page")
    revalidatePath("/employees", "page")
    
    return constructServerResponse({
      success: true,
      message: "Foto do funcionário removida com sucesso"
    })
  } catch (error) {
    console.error("Erro ao remover foto do funcionário:", error)
    return constructServerResponse({
      error: error instanceof Error ? error.message : "Erro ao remover foto do funcionário",
      success: false
    })
  }
}

/**
 * Server action para fazer upload de uma foto
 * @param uploadData Dados para upload (arquivo, caminho e tipo de conteúdo)
 * @returns URL pública da foto ou erro
 */
export async function uploadEmployeePhoto(uploadData: PhotoUploadData): Promise<ServerResponse> {
  try {
    const service = new PhotoService()
    const result = await service.uploadPhoto(uploadData)
    
    if (result.error) {
      return constructServerResponse({
        error: result.error,
        success: false
      })
    }
    
    return constructServerResponse({
      data: { photoUrl: result.path },
      success: true,
      message: "Foto enviada com sucesso"
    })
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error)
    return constructServerResponse({
      error: error instanceof Error ? error.message : "Erro ao fazer upload da foto",
      success: false
    })
  }
} 