import { z } from "zod"

export const roleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  company_id: z.string().uuid(),
})

export type Role = z.infer<typeof roleSchema> 