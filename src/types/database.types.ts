export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          address: string
          phone: string | null
          whatsapp: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone?: string | null
          whatsapp?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string | null
          whatsapp?: string | null
          is_active?: boolean
        }
      }
      // Add other tables here based on schema.sql when fully defined
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
