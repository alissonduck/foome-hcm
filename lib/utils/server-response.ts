/**
 * Utilitários para formatação de respostas de server actions
 */

/**
 * Interface para resposta padronizada de server actions
 */
export interface ServerResponse {
  data?: any
  success: boolean
  message?: string
  error?: string
}

/**
 * Parâmetros para construção da resposta de server action
 */
interface ServerResponseParams {
  data?: any
  success: boolean
  message?: string
  error?: string
}

/**
 * Constrói uma resposta padronizada para server actions
 * @param params Parâmetros da resposta
 * @returns Resposta padronizada
 */
export function constructServerResponse(params: ServerResponseParams): ServerResponse {
  return {
    data: params.data,
    success: params.success,
    message: params.message,
    error: params.error
  }
} 