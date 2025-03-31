import { z } from "zod"

export const employeeRoleSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  role_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().nullable(),
  is_current: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  company_id: z.string().uuid(),
  role: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    company_id: z.string().uuid(),
  }),
})

export type EmployeeRole = z.infer<typeof employeeRoleSchema>

export type CreateEmployeeRoleInput = {
  employee_id: string
  role_id: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  notes?: string | null
}

export type UpdateEmployeeRoleInput = Partial<CreateEmployeeRoleInput> 