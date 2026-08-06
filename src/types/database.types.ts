/* eslint-disable @typescript-eslint/no-explicit-any */
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
        Insert: any
        Update: any
      }
      services: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          price: number
          duration_minutes: number
          is_active: boolean
        }
        Insert: any
        Update: any
      }
      barbers: {
        Row: {
          id: string
          name: string
          is_active: boolean
        }
        Insert: any
        Update: any
      }
      queues: {
        Row: {
          id: string
          branch_id: string
          queue_date: string
          queue_number: number
          customer_name: string
          phone: string
          service_id: string
          preferred_barber_id: string | null
          assigned_barber_id: string | null
          status: string
          source: string
          joined_at: string
          called_at: string | null
          started_at: string | null
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: any
        Update: any
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
