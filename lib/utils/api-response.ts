/**
 * Utilitários para formatação de respostas da API
 * Fornece funções padronizadas para respostas HTTP
 */
import { NextResponse } from "next/server"

/**
 * Interface para resposta padronizada da API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    message: string
    details?: any
    code?: string
  }
  meta?: {
    page?: number
    pageSize?: number
    totalItems?: number
    totalPages?: number
  }
}

/**
 * Parâmetros para construção da resposta da API
 */
interface ApiResponseParams<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string | {
    message: string
    details?: any
    code?: string
  }
  meta?: {
    page?: number
    pageSize?: number
    totalItems?: number
    totalPages?: number
  }
  status?: number
  [key: string]: any
}

/**
 * Constrói uma resposta de sucesso da API
 * @param params Parâmetros da resposta
 * @returns Resposta HTTP formatada
 */
export function successResponse<T = any>(params: Omit<ApiResponseParams<T>, "success" | "error">): NextResponse<ApiResponse<T>> {
  const { data, message, status = 200, meta, ...rest } = params
  
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
    ...rest
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Constrói uma resposta de erro da API
 * @param params Parâmetros da resposta
 * @returns Resposta HTTP formatada
 */
export function errorResponse(params: Omit<ApiResponseParams, "success" | "data">): NextResponse<ApiResponse> {
  const { error, status = 400, ...rest } = params
  
  const errorObject = typeof error === 'string' 
    ? { message: error } 
    : error || { message: 'Erro desconhecido' }
  
  const response: ApiResponse = {
    success: false,
    error: errorObject,
    ...rest
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Status codes da API
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
}

/**
 * Códigos de erro da API
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
}