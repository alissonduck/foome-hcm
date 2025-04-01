"use client"

/**
 * Componente para upload e gerenciamento de fotos de funcionários
 */
import { useRef, useState } from "react"
import Image from "next/image"
import { Camera, Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEmployeePhoto } from "@/hooks/use-employee-photo"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  employeeId?: string
  className?: string
}

/**
 * Componente para upload e visualização de fotos de funcionários
 */
export function PhotoUpload({ employeeId, className }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const {
    photo,
    isLoadingPhoto,
    isUploading,
    handlePhotoUpload,
    deletePhoto
  } = useEmployeePhoto(employeeId)

  // Função para acionar o input de arquivo
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // Função para ler o arquivo e gerar prévia
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Criar prévia local
    const fileUrl = URL.createObjectURL(file)
    setPreviewUrl(fileUrl)

    // Processar upload
    handlePhotoUpload(file)

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Função para remover a foto
  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    deletePhoto()
  }

  // URL da foto (prévia temporária ou foto armazenada)
  const photoUrl = previewUrl || (photo?.admission_photo || null)

  return (
    <Card className={cn("relative p-1 overflow-hidden flex flex-col items-center justify-center", className)}>
      <div className="w-full aspect-[3/4] relative rounded-md overflow-hidden bg-muted">
        {isLoadingPhoto ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : photoUrl ? (
          <>
            <Image
              src={photoUrl}
              alt="Foto do funcionário"
              fill
              className="object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute bottom-2 right-2 rounded-full"
              onClick={handleRemovePhoto}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-muted cursor-pointer"
            onClick={handleClick}
          >
            <Camera className="h-12 w-12 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center px-2">
              Nenhuma foto adicionada
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {!photoUrl && (
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={handleClick}
          disabled={isUploading}
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          Adicionar foto
        </Button>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Enviando...</p>
          </div>
        </div>
      )}
    </Card>
  )
} 