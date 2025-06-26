import { supabase } from "@/lib/supabase"
import type { ShoppingList, ShoppingItem } from "@/types/database"

// Repository Pattern for Shopping Lists
export class ShoppingListRepository {
  async getLists(): Promise<ShoppingList[]> {
    const { data, error } = await supabase.from("shopping_lists").select("*").order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createList(name: string, description?: string): Promise<ShoppingList> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        name,
        description,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateList(id: string, updates: Partial<ShoppingList>): Promise<ShoppingList> {
    const { data, error } = await supabase
      .from("shopping_lists")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteList(id: string): Promise<void> {
    const { error } = await supabase.from("shopping_lists").delete().eq("id", id)

    if (error) throw error
  }

  async shareList(listId: string, userEmail: string): Promise<void> {
    // First, find the user by email
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (profileError || !profiles) {
      throw new Error("Usuario no encontrado")
    }

    // Add user as member
    const { error } = await supabase.from("list_members").insert({
      list_id: listId,
      user_id: profiles.id,
      role: "member",
    })

    if (error) throw error
  }
}

// Repository Pattern for Shopping Items
export class ShoppingItemRepository {
  async getItems(listId: string): Promise<ShoppingItem[]> {
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createItem(item: Omit<ShoppingItem, "id" | "created_at" | "updated_at">): Promise<ShoppingItem> {
    const { data, error } = await supabase.from("shopping_items").insert(item).select().single()

    if (error) throw error
    return data
  }

  async updateItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
    const { data, error } = await supabase
      .from("shopping_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("shopping_items").delete().eq("id", id)

    if (error) throw error
  }

  async toggleComplete(id: string, isCompleted: boolean): Promise<ShoppingItem> {
    return this.updateItem(id, { is_completed: isCompleted })
  }
}

// Service instances
export const shoppingListService = new ShoppingListRepository()
export const shoppingItemService = new ShoppingItemRepository()
