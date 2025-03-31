/**
 * Esquemas de validação para férias e ausências (time-off)
 * Utiliza a biblioteca Zod para validar os dados de entrada
 */

import { z } from "zod"
import { TimeOffType, TimeOffStatus } from "@/lib/types/time-off"

/**
 * Esquema para validação dos tipos de time-off
 */
export const timeOffTypeSchema = z.enum([
  "vacation",
  "sick_leave",
  "maternity_leave",
  "paternity_leave",
  "bereavement",
  "personal",
  "other",
]) as z.ZodType<TimeOffType>

/**
 * Esquema para validação dos status de time-off
 */
export const timeOffStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]) as z.ZodType<TimeOffStatus>

/**
 * Esquema para criação de uma nova solicitação de time-off
 */
export const timeOffCreateSchema = z.object({
  employee_id: z.string({
    required_error: "O ID do funcionário é obrigatório",
  }),
  type: timeOffTypeSchema,
  start_date: z.string({
    required_error: "A data de início é obrigatória",
  }),
  end_date: z.string({
    required_error: "A data de término é obrigatória",
  }),
  reason: z.string().min(3, {
    message: "O motivo deve ter pelo menos 3 caracteres",
  }),
  total_days: z.number({
    required_error: "O total de dias é obrigatório",
  }),
}).refine(
  (data) => {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
  },
  {
    message: "A data de término deve ser igual ou posterior à data de início",
    path: ["end_date"],
  }
)

/**
 * Esquema para atualização do status de uma solicitação de time-off
 */
export const timeOffStatusUpdateSchema = z.object({
  status: timeOffStatusSchema,
  approved_by: z.string({
    required_error: "O ID do aprovador é obrigatório",
  }),
  approved_at: z.string().optional(),
})

/**
 * Esquema para o formulário de solicitação de time-off
 */
export const timeOffFormSchema = z.object({
  type: z.string({
    required_error: "Selecione o tipo de ausência",
  }),
  employeeId: z.string({
    required_error: "Selecione o funcionário",
  }),
  startDate: z.string({
    required_error: "Selecione a data de início",
  }),
  endDate: z.string({
    required_error: "Selecione a data de término",
  }),
  reason: z.string().min(3, {
    message: "O motivo deve ter pelo menos 3 caracteres",
  }),
}).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end >= start
  },
  {
    message: "A data de término deve ser igual ou posterior à data de início",
    path: ["endDate"],
  }
) 