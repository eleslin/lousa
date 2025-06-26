export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      shopping_items: {
        Row: {
          id: string
          list_id: string
          name: string
          quantity: number
          category: string
          is_completed: boolean
          is_recurring: boolean
          recurring_days: number | null
          last_added: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          name: string
          quantity?: number
          category?: string
          is_completed?: boolean
          is_recurring?: boolean
          recurring_days?: number | null
          last_added?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          name?: string
          quantity?: number
          category?: string
          is_completed?: boolean
          is_recurring?: boolean
          recurring_days?: number | null
          last_added?: string
          created_at?: string
          updated_at?: string
        }
      }
      list_members: {
        Row: {
          id: string
          list_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
    }
  }
}

export type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"]
export type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ListMember = Database["public"]["Tables"]["list_members"]["Row"]
