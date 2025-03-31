"use client"

/**
 * Componente de input formatado
 * Permite a entrada de dados com formatação automática como CPF, CNPJ, telefone, etc.
 */
import React, { useState, forwardRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import * as formatters from "@/lib/utils/formatters"

export type FormatterType = 
  | "cpf" 
  | "cnpj" 
  | "phone" 
  | "cellphone" 
  | "currency" 
  | "rg"  // RG pode ter 8, 9 ou 10 dígitos
  | "cep" 
  | "date"

export interface FormattedInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  formatter: FormatterType
  onChange?: (value: string) => void
  onValueChange?: (rawValue: string) => void
}

/**
 * Input formatado para diferentes tipos de dados
 * @param formatter Tipo de formatação a ser aplicada
 * @param onChange Função chamada quando o valor formatado muda
 * @param onValueChange Função chamada quando o valor raw (apenas números) muda
 * @param props Outras propriedades do input
 * @returns Componente de input formatado
 */
const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ formatter, onChange, onValueChange, ...props }, ref) => {
    const [value, setValue] = useState(props.value as string || props.defaultValue as string || "")

    // Aplicar formatação ao carregar o componente
    useEffect(() => {
      if (props.value !== undefined && props.value !== null) {
        const formattedValue = formatValue(props.value as string)
        if (formattedValue !== value) {
          setValue(formattedValue)
        }
      }
    }, [props.value])

    /**
     * Formata o valor com base no tipo de formatador
     * @param val Valor a ser formatado
     * @returns Valor formatado
     */
    const formatValue = (val: string): string => {
      if (!val) return ""

      switch (formatter) {
        case "cpf":
          return formatters.formatCPF(val)
        case "cnpj":
          return formatters.formatCNPJ(val)
        case "phone":
          return formatters.formatPhone(val)
        case "cellphone":
          return formatters.formatCellphone(val)
        case "currency":
          return formatters.formatCurrency(val)
        case "rg":
          return formatters.formatRG(val)
        case "cep":
          return formatters.formatCEP(val)
        case "date":
          return formatters.formatDate(val)
        default:
          return val
      }
    }

    /**
     * Obtém o valor raw (apenas números) com base no valor formatado
     * @param val Valor formatado
     * @returns Valor raw (apenas números)
     */
    const getRawValue = (val: string): string => {
      return formatters.numbersOnly(val)
    }

    /**
     * Manipula a mudança de valor do input
     * @param e Evento de mudança
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formattedValue = formatValue(inputValue)
      const rawValue = getRawValue(inputValue)

      setValue(formattedValue)
      
      if (onChange) {
        onChange(formattedValue)
      }
      
      if (onValueChange) {
        onValueChange(rawValue)
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
      />
    )
  }
)

FormattedInput.displayName = "FormattedInput"

export { FormattedInput } 