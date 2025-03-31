import { createClient } from "@/lib/supabase/server"
import { EmployeeRole, CreateEmployeeRoleInput, UpdateEmployeeRoleInput } from "@/lib/types/employee-role"

export class EmployeeRoleService {
  private async getSupabase() {
    return await createClient()
  }

  async list(employeeId: string): Promise<EmployeeRole[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        role:roles(*)
      `)
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })

    if (error) throw error
    return data
  }

  async create(input: CreateEmployeeRoleInput): Promise<EmployeeRole> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_roles")
      .insert([input])
      .select(`
        *,
        role:roles(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, input: UpdateEmployeeRoleInput): Promise<EmployeeRole> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_roles")
      .update(input)
      .eq("id", id)
      .select(`
        *,
        role:roles(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from("employee_roles")
      .delete()
      .eq("id", id)

    if (error) throw error
  }

  async getCurrentRole(employeeId: string): Promise<EmployeeRole | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_roles")
      .select(`
        *,
        role:roles(*)
      `)
      .eq("employee_id", employeeId)
      .eq("is_current", true)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }
} 