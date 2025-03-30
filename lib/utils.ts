/**
 * Funções utilitárias para a aplicação
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { EmployeeStatus, ContractType, MaritalStatus, EducationLevel } from "./types"

// Exportando os enums para uso em outros arquivos
export { EmployeeStatus, ContractType, MaritalStatus, EducationLevel }

/**
 * Combina classes CSS com suporte a Tailwind
 * @param inputs Classes CSS a serem combinadas
 * @returns String com as classes combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um CNPJ para exibição
 * @param cnpj CNPJ a ser formatado
 * @returns CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, "")

  // Aplica a máscara
  return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

/**
 * Formata um CPF para exibição
 * @param cpf CPF a ser formatado
 * @returns CPF formatado (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, "")

  // Aplica a máscara
  return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

/**
 * Formata um telefone para exibição
 * @param phone Telefone a ser formatado
 * @returns Telefone formatado ((XX) XXXXX-XXXX)
 */
export function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, "")

  // Aplica a máscara
  if (numbers.length === 11) {
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
  } else if (numbers.length === 10) {
    return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3")
  }

  return phone
}

/**
 * Formata uma data para exibição
 * @param date Data a ser formatada
 * @returns Data formatada (DD/MM/YYYY)
 */
export function formatDate(date: string): string {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleDateString("pt-BR")
}

/**
 * Traduz o status do funcionário para português
 * @param status Status em inglês
 * @returns Status traduzido
 */
export function translateEmployeeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: "Ativo",
    vacation: "Em Férias",
    terminated: "Desligado",
    maternity_leave: "Licença Maternidade",
    sick_leave: "Licença Saúde",
  }

  return statusMap[status] || status
}

/**
 * Traduz o tipo de contrato para português
 * @param type Tipo de contrato em inglês
 * @returns Tipo de contrato traduzido
 */
export function translateContractType(type: string): string {
  const typeMap: Record<string, string> = {
    clt: "CLT",
    pj: "PJ",
  }

  return typeMap[type] || type
}

/**
 * Traduz o estado civil para português
 * @param status Estado civil em inglês
 * @returns Estado civil traduzido
 */
export function translateMaritalStatus(status: string): string {
  const statusMap: Record<string, string> = {
    single: "Solteiro(a)",
    married: "Casado(a)",
    divorced: "Divorciado(a)",
    widowed: "Viúvo(a)",
  }

  return statusMap[status] || status
}

/**
 * Traduz o nível de educação para português
 * @param level Nível de educação em inglês
 * @returns Nível de educação traduzido
 */
export function translateEducationLevel(level: string): string {
  const levelMap: Record<string, string> = {
    elementary: "Ensino Fundamental",
    high_school: "Ensino Médio",
    technical: "Ensino Técnico",
    bachelor: "Graduação",
    master: "Mestrado",
    doctorate: "Doutorado",
  }

  return levelMap[level] || level
}

