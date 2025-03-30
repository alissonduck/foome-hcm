/**
 * Tipos gerados para o Supabase
 * Definição dos tipos para as tabelas do banco de dados
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          cnpj: string
          size_range: string
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj: string
          size_range: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string
          size_range?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string | null
          position: string | null
          department: string | null
          status: string
          contract_type: string
          hire_date: string | null
          cpf: string | null
          rg: string | null
          pis: string | null
          ctps: string | null
          marital_status: string | null
          education_level: string | null
          dependents: string | null
          cnpj: string | null
          company_name: string | null
          service_description: string | null
          address: Json | null
          bank_info: Json | null
          emergency_contact: Json | null
          is_admin: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          full_name: string
          email: string
          phone?: string | null
          position?: string | null
          department?: string | null
          status?: string
          contract_type: string
          hire_date?: string | null
          cpf?: string | null
          rg?: string | null
          pis?: string | null
          ctps?: string | null
          marital_status?: string | null
          education_level?: string | null
          dependents?: string | null
          cnpj?: string | null
          company_name?: string | null
          service_description?: string | null
          address?: Json | null
          bank_info?: Json | null
          emergency_contact?: Json | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          position?: string | null
          department?: string | null
          status?: string
          contract_type?: string
          hire_date?: string | null
          cpf?: string | null
          rg?: string | null
          pis?: string | null
          ctps?: string | null
          marital_status?: string | null
          education_level?: string | null
          dependents?: string | null
          cnpj?: string | null
          company_name?: string | null
          service_description?: string | null
          address?: Json | null
          bank_info?: Json | null
          emergency_contact?: Json | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      employee_documents: {
        Row: {
          id: string
          employee_id: string
          name: string
          type: string
          status: string
          file_path: string | null
          file_name: string | null
          file_type: string | null
          file_size: number | null
          notes: string | null
          expiration_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          name: string
          type: string
          status?: string
          file_path?: string | null
          file_name?: string | null
          file_type?: string | null
          file_size?: number | null
          notes?: string | null
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          name?: string
          type?: string
          status?: string
          file_path?: string | null
          file_name?: string | null
          file_type?: string | null
          file_size?: number | null
          notes?: string | null
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_off: {
        Row: {
          id: string
          employee_id: string
          type: string
          status: string
          reason: string | null
          start_date: string
          end_date: string
          total_days: number
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          type: string
          status?: string
          reason?: string | null
          start_date: string
          end_date: string
          total_days: number
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          type?: string
          status?: string
          reason?: string | null
          start_date?: string
          end_date?: string
          total_days?: number
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      onboarding_tasks: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          category: string | null
          is_required: boolean
          default_due_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          category?: string | null
          is_required?: boolean
          default_due_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          category?: string | null
          is_required?: boolean
          default_due_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      employee_onboarding: {
        Row: {
          id: string
          employee_id: string
          task_id: string
          status: string
          due_date: string | null
          notes: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          task_id: string
          status?: string
          due_date?: string | null
          notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          task_id?: string
          status?: string
          due_date?: string | null
          notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      subteams: {
        Row: {
          id: string
          team_id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          employee_id: string
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          employee_id: string
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          employee_id?: string
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      subteam_members: {
        Row: {
          id: string
          subteam_id: string
          employee_id: string
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subteam_id: string
          employee_id: string
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subteam_id?: string
          employee_id?: string
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          company_id: string
          title: string
          cbo_name: string | null
          cbo_number: string | null
          contract_type: string
          active: boolean
          team_id: string | null
          description: string | null
          salary_periodicity: string | null
          salary: number | null
          cnh: string | null
          work_model: string | null
          level: string | null
          seniority_level: string | null
          seniority_scale: number | null
          required_requirements: string | null
          desired_requirements: string | null
          deliveries_results: string | null
          education_level: string | null
          education_status: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          cbo_name?: string | null
          cbo_number?: string | null
          contract_type: string
          active?: boolean
          team_id?: string | null
          description?: string | null
          salary_periodicity?: string | null
          salary?: number | null
          cnh?: string | null
          work_model?: string | null
          level?: string | null
          seniority_level?: string | null
          seniority_scale?: number | null
          required_requirements?: string | null
          desired_requirements?: string | null
          deliveries_results?: string | null
          education_level?: string | null
          education_status?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          cbo_name?: string | null
          cbo_number?: string | null
          contract_type?: string
          active?: boolean
          team_id?: string | null
          description?: string | null
          salary_periodicity?: string | null
          salary?: number | null
          cnh?: string | null
          work_model?: string | null
          level?: string | null
          seniority_level?: string | null
          seniority_scale?: number | null
          required_requirements?: string | null
          desired_requirements?: string | null
          deliveries_results?: string | null
          education_level?: string | null
          education_status?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      role_employees: {
        Row: {
          id: string
          role_id: string
          employee_id: string
          start_date: string
          end_date: string | null
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          employee_id: string
          start_date: string
          end_date?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          employee_id?: string
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      role_courses: {
        Row: {
          id: string
          role_id: string
          name: string
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          name: string
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          name?: string
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      role_complementary_courses: {
        Row: {
          id: string
          role_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      role_technical_skills: {
        Row: {
          id: string
          role_id: string
          name: string
          level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          name: string
          level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          name?: string
          level?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      role_behavioral_skills: {
        Row: {
          id: string
          role_id: string
          name: string
          level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          name: string
          level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          name?: string
          level?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      role_languages: {
        Row: {
          id: string
          role_id: string
          name: string
          level: string | null
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_id: string
          name: string
          level?: string | null
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          name?: string
          level?: string | null
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

