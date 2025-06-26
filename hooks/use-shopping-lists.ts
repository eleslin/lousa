"use client"

import { useState, useEffect } from "react"
import { shoppingListService } from "@/services/shopping-service"
import { supabase } from "@/lib/supabase"
import type { ShoppingList } from "@/types/database"

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = async () => {
    try {
      setLoading(true)
      const data = await shoppingListService.getLists()
      setLists(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading lists")
    } finally {
      setLoading(false)
    }
  }

  const createList = async (name: string, description?: string) => {
    try {
      const newList = await shoppingListService.createList(name, description)
      setLists((prev) => [newList, ...prev])
      return newList
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating list")
      throw err
    }
  }

  const updateList = async (id: string, updates: Partial<ShoppingList>) => {
    try {
      const updatedList = await shoppingListService.updateList(id, updates)
      setLists((prev) => prev.map((list) => (list.id === id ? updatedList : list)))
      return updatedList
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating list")
      throw err
    }
  }

  const deleteList = async (id: string) => {
    try {
      await shoppingListService.deleteList(id)
      setLists((prev) => prev.filter((list) => list.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting list")
      throw err
    }
  }

  useEffect(() => {
    fetchLists()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel("shopping_lists_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_lists" }, () => {
        fetchLists()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    refetch: fetchLists,
  }
}
