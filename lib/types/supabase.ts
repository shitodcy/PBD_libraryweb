// Supabase database types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          description: string | null
          category: string | null
          isbn: string | null
          publication_year: number | null
          pages: number | null
          cover_url: string | null
          total_copies: number
          available_copies: number
          rating: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          description?: string | null
          category?: string | null
          isbn?: string | null
          publication_year?: number | null
          pages?: number | null
          cover_url?: string | null
          total_copies?: number
          available_copies?: number
          rating?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          description?: string | null
          category?: string | null
          isbn?: string | null
          publication_year?: number | null
          pages?: number | null
          cover_url?: string | null
          total_copies?: number
          available_copies?: number
          rating?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      borrowings: {
        Row: {
          id: string
          user_id: string
          book_id: string
          borrowed_at: string
          due_date: string
          returned_at: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          borrowed_at?: string
          due_date: string
          returned_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          borrowed_at?: string
          due_date?: string
          returned_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          book_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          book_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          created_at?: string
        }
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          progress_percentage: number
          last_read_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          progress_percentage?: number
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          progress_percentage?: number
          last_read_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
