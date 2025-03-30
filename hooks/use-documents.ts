/**
 * Hook para gerenciar documentos
 * Contém métodos para interagir com documentos usando React Query
 */
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { documentService } from "@/lib/services/document-service"
import type { 
  DocumentUploadFormValues 
} from "@/lib/schemas/document-schema"
import type {
  EmployeeDocumentUpdate,
  DocumentStatus
} from "@/lib/types/documents"

/**
 * Hook para gerenciar documentos
 * @returns Métodos e estados para gerenciar documentos
 */
export function useDocuments() {
  const queryClient = useQueryClient()

  // Consultas
  const useDocumentsQuery = (employeeId: string | null, companyId: string) =>
    useQuery({
      queryKey: ["documents", employeeId, companyId],
      queryFn: () => documentService.getDocuments(employeeId, companyId),
    })

  const useDocumentQuery = (documentId: string) =>
    useQuery({
      queryKey: ["document", documentId],
      queryFn: () => documentService.getDocument(documentId),
      enabled: !!documentId,
    })

  // Mutações
  const useUploadDocumentMutation = () =>
    useMutation({
      mutationFn: async (values: DocumentUploadFormValues & { employeeId: string }) => {
        const file = values.file[0]
        
        // Faz upload do arquivo
        const uploadResult = await documentService.uploadFile(values.employeeId, file)
        
        // Cria o documento no banco de dados
        return documentService.createDocument({
          employee_id: values.employeeId,
          name: values.name,
          type: values.type,
          status: "pending",
          file_path: uploadResult.filePath,
          file_name: uploadResult.fileName,
          file_type: uploadResult.fileType,
          file_size: uploadResult.fileSize,
          expiration_date: values.expirationDate || null,
        })
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["documents"] })
        toast.success("Documento enviado com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao enviar documento: ${error.message}`)
      },
    })

  const useUpdateDocumentMutation = () =>
    useMutation({
      mutationFn: ({ documentId, data }: { documentId: string; data: EmployeeDocumentUpdate }) =>
        documentService.updateDocument(documentId, data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["documents"] })
        queryClient.invalidateQueries({ queryKey: ["document", data.id] })
        toast.success("Documento atualizado com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar documento: ${error.message}`)
      },
    })

  const useUpdateDocumentStatusMutation = () =>
    useMutation({
      mutationFn: ({ documentId, status }: { documentId: string; status: DocumentStatus }) =>
        documentService.updateDocumentStatus(documentId, status),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["documents"] })
        queryClient.invalidateQueries({ queryKey: ["document", data.id] })
        toast.success(`Status do documento alterado para ${translateStatus(data.status)}!`)
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar status do documento: ${error.message}`)
      },
    })

  const useDeleteDocumentMutation = () =>
    useMutation({
      mutationFn: (documentId: string) => documentService.deleteDocument(documentId),
      onSuccess: (_, documentId) => {
        queryClient.invalidateQueries({ queryKey: ["documents"] })
        queryClient.removeQueries({ queryKey: ["document", documentId] })
        toast.success("Documento excluído com sucesso!")
      },
      onError: (error) => {
        toast.error(`Erro ao excluir documento: ${error.message}`)
      },
    })

  /**
   * Traduz o status do documento para português
   * @param status Status em inglês
   * @returns Status traduzido
   */
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    }
    
    return statusMap[status] || status
  }

  return {
    // Consultas
    useDocumentsQuery,
    useDocumentQuery,
    
    // Mutações
    useUploadDocumentMutation,
    useUpdateDocumentMutation,
    useUpdateDocumentStatusMutation,
    useDeleteDocumentMutation,
    
    // Utilitários
    translateStatus,
  }
} 