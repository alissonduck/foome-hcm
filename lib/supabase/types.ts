export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone_code: string | null
          state_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone_code?: string | null
          state_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone_code?: string | null
          state_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          size_range: string
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          size_range: string
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          size_range?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          abbreviation: string
          created_at: string | null
          id: string
          name: string
          phone_code: string | null
          updated_at: string | null
        }
        Insert: {
          abbreviation: string
          created_at?: string | null
          id?: string
          name: string
          phone_code?: string | null
          updated_at?: string | null
        }
        Update: {
          abbreviation?: string
          created_at?: string | null
          id?: string
          name?: string
          phone_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_addresses: {
        Row: {
          city_id: string
          complement: string | null
          country_id: string
          created_at: string | null
          employee_id: string
          id: string
          neighborhood: string
          number: string
          postal_code: string
          state_id: string
          street: string
          updated_at: string | null
        }
        Insert: {
          city_id: string
          complement?: string | null
          country_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          neighborhood: string
          number: string
          postal_code: string
          state_id: string
          street: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          complement?: string | null
          country_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          neighborhood?: string
          number?: string
          postal_code?: string
          state_id?: string
          street?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_addresses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_addresses_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_addresses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_addresses_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_dependents: {
        Row: {
          birth_certificate_number: string | null
          birth_date: string
          cpf: string | null
          created_at: string | null
          employee_id: string
          full_name: string
          gender: string
          has_disability: boolean | null
          id: string
          is_student: boolean | null
          notes: string | null
          relationship: string
          updated_at: string | null
        }
        Insert: {
          birth_certificate_number?: string | null
          birth_date: string
          cpf?: string | null
          created_at?: string | null
          employee_id: string
          full_name: string
          gender: string
          has_disability?: boolean | null
          id?: string
          is_student?: boolean | null
          notes?: string | null
          relationship: string
          updated_at?: string | null
        }
        Update: {
          birth_certificate_number?: string | null
          birth_date?: string
          cpf?: string | null
          created_at?: string | null
          employee_id?: string
          full_name?: string
          gender?: string
          has_disability?: boolean | null
          id?: string
          is_student?: boolean | null
          notes?: string | null
          relationship?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_dependents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string | null
          employee_id: string
          expiration_date: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          notes: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          expiration_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          expiration_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_onboarding: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          due_date: string | null
          employee_id: string
          id: string
          notes: string | null
          status: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_onboarding_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "onboarding_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_photos: {
        Row: {
          admission_photo: string | null
          created_at: string | null
          employee_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          admission_photo?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          admission_photo?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_photos_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_roles: {
        Row: {
          company_id: string
          created_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          is_current: boolean
          notes: string | null
          role_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          role_id: string
          start_date?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          role_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_roles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: Json | null
          bank_info: Json | null
          cnpj: string | null
          company_id: string
          company_name: string | null
          contract_type: string
          cpf: string | null
          created_at: string | null
          created_by: string | null
          ctps: string | null
          dependents: string | null
          education_level: string | null
          email: string
          emergency_contact: Json | null
          full_name: string
          hire_date: string | null
          id: string
          is_admin: boolean | null
          marital_status: string | null
          phone: string | null
          pis: string | null
          position: string | null
          rg: string | null
          role_id: string | null
          service_description: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          bank_info?: Json | null
          cnpj?: string | null
          company_id: string
          company_name?: string | null
          contract_type: string
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          ctps?: string | null
          dependents?: string | null
          education_level?: string | null
          email: string
          emergency_contact?: Json | null
          full_name: string
          hire_date?: string | null
          id?: string
          is_admin?: boolean | null
          marital_status?: string | null
          phone?: string | null
          pis?: string | null
          position?: string | null
          rg?: string | null
          role_id?: string | null
          service_description?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          bank_info?: Json | null
          cnpj?: string | null
          company_id?: string
          company_name?: string | null
          contract_type?: string
          cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          ctps?: string | null
          dependents?: string | null
          education_level?: string | null
          email?: string
          emergency_contact?: Json | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_admin?: boolean | null
          marital_status?: string | null
          phone?: string | null
          pis?: string | null
          position?: string | null
          rg?: string | null
          role_id?: string | null
          service_description?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          default_due_days: number | null
          description: string | null
          id: string
          is_required: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          default_due_days?: number | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          default_due_days?: number | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_behavioral_skills: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          name: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          name: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          name?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_behavioral_skills_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_complementary_courses: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_complementary_courses_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_courses: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          name: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_courses_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_languages: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          level: string | null
          name: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          level?: string | null
          name: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          level?: string | null
          name?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_languages_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_technical_skills: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          name: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          name: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          name?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_technical_skills_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          active: boolean | null
          cbo_name: string | null
          cbo_number: string | null
          cnh: string | null
          company_id: string
          contract_type: string
          created_at: string | null
          created_by: string | null
          deliveries_results: string | null
          description: string | null
          desired_requirements: string | null
          education_level: string | null
          education_status: string | null
          id: string
          level: string | null
          required_requirements: string | null
          salary: number | null
          salary_periodicity: string | null
          seniority_level: string | null
          seniority_scale: number | null
          team_id: string | null
          title: string
          updated_at: string | null
          work_model: string | null
        }
        Insert: {
          active?: boolean | null
          cbo_name?: string | null
          cbo_number?: string | null
          cnh?: string | null
          company_id: string
          contract_type: string
          created_at?: string | null
          created_by?: string | null
          deliveries_results?: string | null
          description?: string | null
          desired_requirements?: string | null
          education_level?: string | null
          education_status?: string | null
          id?: string
          level?: string | null
          required_requirements?: string | null
          salary?: number | null
          salary_periodicity?: string | null
          seniority_level?: string | null
          seniority_scale?: number | null
          team_id?: string | null
          title: string
          updated_at?: string | null
          work_model?: string | null
        }
        Update: {
          active?: boolean | null
          cbo_name?: string | null
          cbo_number?: string | null
          cnh?: string | null
          company_id?: string
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          deliveries_results?: string | null
          description?: string | null
          desired_requirements?: string | null
          education_level?: string | null
          education_status?: string | null
          id?: string
          level?: string | null
          required_requirements?: string | null
          salary?: number | null
          salary_periodicity?: string | null
          seniority_level?: string | null
          seniority_scale?: number | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
          work_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          abbreviation: string
          country_id: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          abbreviation: string
          country_id: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          abbreviation?: string
          country_id?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      subteam_members: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          joined_at: string | null
          subteam_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          joined_at?: string | null
          subteam_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          joined_at?: string | null
          subteam_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subteam_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subteam_members_subteam_id_fkey"
            columns: ["subteam_id"]
            isOneToOne: false
            referencedRelation: "subteams"
            referencedColumns: ["id"]
          },
        ]
      }
      subteams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          manager_id: string | null
          name: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subteams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subteams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subteams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          joined_at: string | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          joined_at?: string | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          joined_at?: string | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string
          total_days: number
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string
          total_days: number
          type: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string
          total_days?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
