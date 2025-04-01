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
  validation?: any
  requireEmailConfirmation?: boolean
  hasCompany?: boolean
  [key: string]: any // Permite propriedades adicionais para flexibilidade
}

/**
 * Parâmetros para construção da resposta de server action
 */
interface ServerResponseParams {
  data?: any
  success: boolean
  message?: string
  error?: string
  validation?: any
  requireEmailConfirmation?: boolean
  hasCompany?: boolean
  [key: string]: any // Permite propriedades adicionais para flexibilidade
}

/**
 * Constrói uma resposta padronizada para server actions
 * @param params Parâmetros da resposta
 * @returns Resposta padronizada
 */
export function constructServerResponse(params: ServerResponseParams): ServerResponse {
  return {
    ...params
  }
} 