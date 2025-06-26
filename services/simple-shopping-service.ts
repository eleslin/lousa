import { supabase } from "@/lib/supabase"
import type { ShoppingList, ShoppingItem } from "@/types/database"

export class SimpleShoppingService {
  // Obtener la lista del usuario (crear si no existe)
  async getUserList(): Promise<ShoppingList> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    let { data: list, error } = await supabase.from("shopping_lists").select("*").eq("owner_id", user.id).single()

    if (error && error.code === "PGRST116") {
      // Lista no existe, crear una nueva
      const { data: newList, error: createError } = await supabase
        .from("shopping_lists")
        .insert({ owner_id: user.id, name: "Mi Lista de Compras" })
        .select()
        .single()

      if (createError) throw createError
      list = newList
    } else if (error) {
      throw error
    }

    return list!
  }

  // Obtener todas las listas accesibles (propias + compartidas)
  async getAccessibleLists(): Promise<ShoppingList[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // Obtener listas propias
    const { data: ownLists, error: ownError } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("owner_id", user.id)

    if (ownError) throw ownError

    // Obtener listas compartidas
    const { data: sharedListIds, error: shareError } = await supabase
      .from("list_shares")
      .select("list_id")
      .eq("shared_with", user.id)

    if (shareError) throw shareError

    let sharedLists: ShoppingList[] = []
    if (sharedListIds && sharedListIds.length > 0) {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .in(
          "id",
          sharedListIds.map((s) => s.list_id),
        )

      if (error) throw error
      sharedLists = data || []
    }

    return [...(ownLists || []), ...sharedLists]
  }

  // Verificar si el usuario tiene acceso a una lista
  async hasAccessToList(listId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    // Verificar si es propietario
    const { data: ownList } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("owner_id", user.id)
      .single()

    if (ownList) return true

    // Verificar si está compartida
    const { data: sharedList } = await supabase
      .from("list_shares")
      .select("id")
      .eq("list_id", listId)
      .eq("shared_with", user.id)
      .single()

    return !!sharedList
  }

  // Obtener productos activos
  async getActiveItems(listId: string): Promise<ShoppingItem[]> {
    const hasAccess = await this.hasAccessToList(listId)
    if (!hasAccess) throw new Error("No tienes acceso a esta lista")

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("list_id", listId)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Obtener productos del histórico
  async getHistoryItems(listId: string): Promise<ShoppingItem[]> {
    const hasAccess = await this.hasAccessToList(listId)
    if (!hasAccess) throw new Error("No tienes acceso a esta lista")

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("list_id", listId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Agregar producto
  async addItem(listId: string, name: string, quantity = 1, category = "other"): Promise<ShoppingItem> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("User:", user)
    if (!user) throw new Error("Usuario no autenticado")

    const hasAccess = await this.hasAccessToList(listId)
    if (!hasAccess) throw new Error("No tienes acceso a esta lista")

    const { data, error } = await supabase
      .from("shopping_items")
      .insert({
        list_id: listId,
        name: name.trim(),
        quantity,
        category,
        status: "active",
        added_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Marcar como completado (mover al histórico)
  async completeItem(itemId: string): Promise<ShoppingItem> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    const { data, error } = await supabase
      .from("shopping_items")
      .update({
        status: "completed",
        completed_by: user.id,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Restaurar del histórico
  async restoreItem(itemId: string): Promise<ShoppingItem> {
    const { data, error } = await supabase
      .from("shopping_items")
      .update({
        status: "active",
        completed_by: null,
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Eliminar producto permanentemente
  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase.from("shopping_items").delete().eq("id", itemId)

    if (error) throw error
  }

  // Compartir lista con otro usuario
  async shareList(listId: string, userEmail: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // Verificar que es propietario de la lista
    const { data: list } = await supabase
      .from("shopping_lists")
      .select("owner_id")
      .eq("id", listId)
      .eq("owner_id", user.id)
      .single()

    if (!list) throw new Error("No tienes permisos para compartir esta lista")

    // Buscar usuario por email
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (profileError || !profiles) {
      throw new Error("Usuario no encontrado")
    }

    // Compartir lista
    const { error } = await supabase.from("list_shares").insert({
      list_id: listId,
      shared_with: profiles.id,
      shared_by: user.id,
    })

    if (error) throw error
  }
}

export const shoppingService = new SimpleShoppingService()
