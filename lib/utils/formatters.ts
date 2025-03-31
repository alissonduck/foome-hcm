/**
 * Formatadores para diferentes tipos de dados
 * Utilitários para formatação e validação de dados como CPF, CNPJ, telefone, etc.
 */

/**
 * Remove todos os caracteres não numéricos
 * @param value Valor a ser limpo
 * @returns Apenas os números do valor
 */
export function numbersOnly(value: string): string {
  return value?.replace(/\D/g, '') || '';
}

/**
 * Formata um CPF (XXX.XXX.XXX-XX)
 * @param value CPF a ser formatado
 * @returns CPF formatado
 */
export function formatCPF(value: string): string {
  const numbers = numbersOnly(value).slice(0, 11);
  
  if (numbers.length <= 3) {
    return numbers;
  }
  
  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Formata um CNPJ (XX.XXX.XXX/XXXX-XX)
 * @param value CNPJ a ser formatado
 * @returns CNPJ formatado
 */
export function formatCNPJ(value: string): string {
  const numbers = numbersOnly(value).slice(0, 14);
  
  if (numbers.length <= 2) {
    return numbers;
  }
  
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  }
  
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  }
  
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  }
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/**
 * Formata um número de telefone (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param value Telefone a ser formatado
 * @returns Telefone formatado
 */
export function formatPhone(value: string): string {
  const numbers = numbersOnly(value).slice(0, 11);
  
  if (numbers.length <= 2) {
    return numbers;
  }
  
  // Se for um celular (tem 11 dígitos)
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
  
  // Se for um telefone fixo (tem 10 dígitos)
  if (numbers.length >= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }
  
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
}

/**
 * Formata um número de celular (XX) XXXXX-XXXX
 * @param value Celular a ser formatado
 * @returns Celular formatado
 */
export function formatCellphone(value: string): string {
  return formatPhone(value);
}

/**
 * Formata um valor em moeda (R$)
 * @param value Valor a ser formatado
 * @returns Valor formatado em BRL
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(numbersOnly(value)) / 100 : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue || 0);
}

/**
 * Converte um valor de moeda formatado para número (cents)
 * @param value Valor formatado (R$ X.XXX,XX)
 * @returns Valor em centavos
 */
export function currencyToNumber(value: string): number {
  const clean = value.replace(/\D/g, '');
  return parseInt(clean, 10);
}

/**
 * Formata um RG (XX.XXX.XXX-X ou XX.XXX.XXX-XX)
 * @param value RG a ser formatado
 * @returns RG formatado
 */
export function formatRG(value: string): string {
  // Remove caracteres não numéricos
  const numbers = numbersOnly(value).slice(0, 10);
  
  // Se o número for muito curto, retorna como está
  if (numbers.length <= 1) {
    return numbers;
  }
  
  // Formato do RG é diferente dependendo do tamanho:
  // - Para 8 dígitos: X.XXX.XXX-X
  // - Para 9 dígitos: XX.XXX.XXX-X
  // - Para 10 dígitos: XX.XXX.XXX-XX
  
  // Ajusta o formato dependendo da quantidade de dígitos
  if (numbers.length === 8) {
    return `${numbers.slice(0, 1)}.${numbers.slice(1, 4)}.${numbers.slice(4, 7)}-${numbers.slice(7)}`;
  }
  
  if (numbers.length === 9) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8)}`;
  }
  
  if (numbers.length === 10) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8, 10)}`;
  }
  
  // Para valores com menos dígitos, formata de forma parcial
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 1)}.${numbers.slice(1)}`;
  }
  
  if (numbers.length <= 7) {
    return `${numbers.slice(0, 1)}.${numbers.slice(1, 4)}.${numbers.slice(4)}`;
  }
  
  // Fallback para outros tamanhos (não deve ocorrer com a lógica acima)
  return numbers;
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/YYYY)
 * @param value Data a ser formatada
 * @returns Data formatada
 */
export function formatDate(value: string): string {
  const numbers = numbersOnly(value).slice(0, 8);
  
  if (numbers.length <= 2) {
    return numbers;
  }
  
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }
  
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

/**
 * Formata um CEP (XXXXX-XXX)
 * @param value CEP a ser formatado
 * @returns CEP formatado
 */
export function formatCEP(value: string): string {
  const numbers = numbersOnly(value).slice(0, 8);
  
  if (numbers.length <= 5) {
    return numbers;
  }
  
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}
