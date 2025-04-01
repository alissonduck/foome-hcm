/**
 * Hook para gerenciar fotos de funcionários no lado cliente
 */
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { 
  getEmployeePhoto, 
  upsertEmployeePhoto, 
  deleteEmployeePhoto, 
  uploadEmployeePhoto 
} from "@/server/actions/photo-actions"
import { PhotoUploadData, EmployeePhotoInsert } from "@/lib/types/photo"

/**
 * Hook para gerenciar fotos de funcionários
 * @param employeeId ID do funcionário
 * @returns Funções e estados para manipulação de fotos
 */
export const useEmployeePhoto = (employeeId?: string) => {
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  // Consulta para obter a foto do funcionário
  const { 
    data: photoData, 
    isLoading: isLoadingPhoto, 
    isError: isPhotoError,
    error: photoError 
  } = useQuery({
    queryKey: ["employee-photo", employeeId],
    queryFn: async () => {
      if (!employeeId) return null
      const result = await getEmployeePhoto(employeeId)
      if (!result.success) {
        throw new Error(result.error || "Erro ao obter foto do funcionário")
      }
      return result.data
    },
    enabled: !!employeeId
  })

  // Mutação para salvar foto do funcionário
  const { mutate: savePhoto } = useMutation({
    mutationFn: async (photo: EmployeePhotoInsert) => {
      const result = await upsertEmployeePhoto(photo)
      if (!result.success) {
        throw new Error(result.error || "Erro ao salvar foto do funcionário")
      }
      return result.data
    },
    onSuccess: () => {
      toast.success("Foto salva com sucesso")
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ["employee-photo", employeeId] })
      }
    },
    onError: (error) => {
      toast.error(`Erro ao salvar foto: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // Mutação para deletar foto do funcionário
  const { mutate: deletePhoto } = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("ID do funcionário não fornecido")
      
      const result = await deleteEmployeePhoto(employeeId)
      if (!result.success) {
        throw new Error(result.error || "Erro ao excluir foto do funcionário")
      }
      return result
    },
    onSuccess: () => {
      toast.success("Foto removida com sucesso")
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ["employee-photo", employeeId] })
      }
    },
    onError: (error) => {
      toast.error(`Erro ao remover foto: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // Função para fazer upload da foto
  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!file || !employeeId) return null
    
    try {
      setIsUploading(true)
      
      // Validar tipo de arquivo
      const validTypes = ["image/jpeg", "image/png", "image/jpg"]
      if (!validTypes.includes(file.type)) {
        toast.error("Formato de arquivo inválido. Use JPEG ou PNG.")
        return null
      }
      
      // Validar tamanho (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error("O arquivo é muito grande. Tamanho máximo: 5MB.")
        return null
      }
      
      // Preparar dados para upload
      const uploadData: PhotoUploadData = {
        fileData: file,
        filePath: `employees/${employeeId}`,
        contentType: file.type
      }
      
      // Fazer upload
      const result = await uploadEmployeePhoto(uploadData)
      
      if (!result.success || !result.data?.photoUrl) {
        throw new Error(result.error || "Erro no upload da foto")
      }
      
      // Retornar URL da foto
      return result.data.photoUrl
      
    } catch (error) {
      console.error("Erro no upload da foto:", error)
      toast.error(`Erro no upload: ${error instanceof Error ? error.message : String(error)}`)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Função completa para processar upload e salvamento de foto
  const handlePhotoUpload = async (file: File) => {
    if (!file || !employeeId) return
    
    const photoUrl = await uploadPhoto(file)
    
    if (photoUrl) {
      // Salvar referência no banco
      savePhoto({
        employee_id: employeeId,
        admission_photo: photoUrl
      })
    }
  }

  return {
    photo: photoData,
    isLoadingPhoto,
    isPhotoError,
    photoError,
    isUploading,
    uploadPhoto,
    handlePhotoUpload,
    savePhoto,
    deletePhoto
  }
} 