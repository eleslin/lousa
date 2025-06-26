"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"
import { shoppingService } from "@/services/simple-shopping-service"

type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"]
type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"]

export function useSimpleShopping() {
  const [list, setList] = useState<ShoppingList | null>(null)
  const [activeItems, setActiveItems] = useState<ShoppingItem[]>([])
  const [historyItems, setHistoryItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const userList = await shoppingService.getUserList()
      if (!userList) {
        throw new Error("No se pudo obtener la lista del usuario")
      }
      setList(userList)

      const [active, history] = await Promise.all([
        shoppingService.getActiveItems(userList.id),
        shoppingService.getHistoryItems(userList.id),
      ])

      setActiveItems(active)
      setHistoryItems(history)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (name: string, quantity = 1, category = "other") => {
    try {
      if (!list) {
        throw new Error("No hay lista disponible")
      }

      console.log("Adding item:", name)
      console.log('list.id:', list.id)
      const newItem = await shoppingService.addItem(list.id, name.trim(), quantity, category)
      setActiveItems((prev) => [newItem, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding item")
      console.error("Error adding item:", err)
    }
  }

  const completeItem = async (itemId: string) => {
    try {
      const completedItem = await shoppingService.completeItem(itemId)
      setActiveItems((prev) => prev.filter((item) => item.id !== itemId))
      setHistoryItems((prev) => [completedItem, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error completing item")
    }
  }

  const restoreItem = async (itemId: string) => {
    try {
      const restoredItem = await shoppingService.restoreItem(itemId)
      setHistoryItems((prev) => prev.filter((item) => item.id !== itemId))
      setActiveItems((prev) => [restoredItem, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error restoring item")
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      await shoppingService.deleteItem(itemId)
      setHistoryItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting item")
    }
  }

  const shareList = async (userEmail: string) => {
    if (!list) return

    try {
      await shoppingService.shareList(list.id, userEmail)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sharing list")
      throw err
    }
  }

  useEffect(() => {
    fetchData()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("shopping_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_items" }, () => fetchData())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    list,
    activeItems,
    historyItems,
    loading,
    error,
    addItem,
    completeItem,
    restoreItem,
    deleteItem,
    shareList,
    refetch: fetchData,
  }
}
