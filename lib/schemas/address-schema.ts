"use client"

/**
 * Schemas de validação para endereços
 * Define os esquemas de validação para endereços de funcionários
 */
import { z } from "zod"

/**
 * Schema para validação de endereço
 */
export const employeeAddressSchema = z.object({
  street: z.string().min(3, { message: "Rua deve ter pelo menos 3 caracteres" }),
  number: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, { message: "Bairro deve ter pelo menos 2 caracteres" }),
  postal_code: z.string().min(8, { message: "CEP deve ter pelo menos 8 caracteres" }),
  country_id: z.string({ required_error: "País é obrigatório" }),
  state_id: z.string({ required_error: "Estado é obrigatório" }),
  city_id: z.string({ required_error: "Cidade é obrigatória" }),
})

/**
 * Schema para validação de país
 */
export const countrySchema = z.object({
  name: z.string().min(2, { message: "Nome do país deve ter pelo menos 2 caracteres" }),
  abbreviation: z.string().min(2, { message: "Abreviação deve ter pelo menos 2 caracteres" }),
  phone_code: z.string().optional(),
})

/**
 * Schema para validação de estado
 */
export const stateSchema = z.object({
  name: z.string().min(2, { message: "Nome do estado deve ter pelo menos 2 caracteres" }),
  abbreviation: z.string().min(1, { message: "Abreviação é obrigatória" }),
  country_id: z.string({ required_error: "País é obrigatório" }),
})

/**
 * Schema para validação de cidade
 */
export const citySchema = z.object({
  name: z.string().min(2, { message: "Nome da cidade deve ter pelo menos 2 caracteres" }),
  phone_code: z.string().optional(),
  state_id: z.string({ required_error: "Estado é obrigatório" }),
})

/**
 * Tipo derivado do schema de endereço
 */
export type EmployeeAddressFormValues = z.infer<typeof employeeAddressSchema>

/**
 * Tipo derivado do schema de país
 */
export type CountryFormValues = z.infer<typeof countrySchema>

/**
 * Tipo derivado do schema de estado
 */
export type StateFormValues = z.infer<typeof stateSchema>

/**
 * Tipo derivado do schema de cidade
 */
export type CityFormValues = z.infer<typeof citySchema> 