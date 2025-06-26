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
          owner_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
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
          status: string
          added_by: string | null
          completed_by: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          name: string
          quantity?: number
          category?: string
          status?: string
          added_by?: string | null
          completed_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          name?: string
          quantity?: number
          category?: string
          status?: string
          added_by?: string | null
          completed_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      list_shares: {
        Row: {
          id: string
          list_id: string
          shared_with: string
          shared_by: string
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          shared_with: string
          shared_by: string
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          shared_with?: string
          shared_by?: string
          created_at?: string
        }
      }
    }
  }
}

// Tipos exportados para usar en la aplicación
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"]
export type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"]
export type ListShare = Database["public"]["Tables"]["list_shares"]["Row"]

// Tipos para insertar datos
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ShoppingListInsert = Database["public"]["Tables"]["shopping_lists"]["Insert"]
export type ShoppingItemInsert = Database["public"]["Tables"]["shopping_items"]["Insert"]
export type ListShareInsert = Database["public"]["Tables"]["list_shares"]["Insert"]

// Tipos para actualizar datos
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
export type ShoppingListUpdate = Database["public"]["Tables"]["shopping_lists"]["Update"]
export type ShoppingItemUpdate = Database["public"]["Tables"]["shopping_items"]["Update"]
export type ListShareUpdate = Database["public"]["Tables"]["list_shares"]["Update"]
