"use client"

import { useState, useEffect } from "react"
import { shoppingItemService } from "@/services/shopping-service"
import { supabase } from "@/lib/supabase"
import type { ShoppingItem } from "@/types/database"

export function useShoppingItems(listId: string) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    if (!listId) return

    try {
      setLoading(true)
      const data = await shoppingItemService.getItems(listId)
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading items")
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (itemData: Omit<ShoppingItem, "id" | "created_at" | "updated_at">) => {
    try {
      const newItem = await shoppingItemService.createItem(itemData)
      setItems((prev) => [newItem, ...prev])
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating item")
      throw err
    }
  }

  const updateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    try {
      const updatedItem = await shoppingItemService.updateItem(id, updates)
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating item")
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await shoppingItemService.deleteItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting item")
      throw err
    }
  }

  const toggleComplete = async (id: string, isCompleted: string) => {
    try {
      const updatedItem = await shoppingItemService.toggleComplete(id, isCompleted)
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating item")
      throw err
    }
  }

  useEffect(() => {
    fetchItems()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`shopping_items_${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_items",
          filter: `list_id=eq.${listId}`,
        },
        () => {
          fetchItems()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [listId])

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    toggleComplete,
    refetch: fetchItems,
  }
}
