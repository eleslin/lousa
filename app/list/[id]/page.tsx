"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useShoppingItems } from "@/hooks/use-shopping-items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Share2, Filter } from "lucide-react"
import { ShoppingItem } from "@/components/shopping-list/shopping-item"
import { AddItemDialog } from "@/components/shopping-list/add-item-dialog"
import { ShareListDialog } from "@/components/shopping-list/share-list-dialog"
import { supabase } from "@/lib/supabase"
import type { ShoppingList, ShoppingItem as ShoppingItemType } from "@/types/database"

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const listId = params.id as string

  const { items, loading, createItem, updateItem, deleteItem, toggleComplete } = useShoppingItems(listId)
  const [list, setList] = useState<ShoppingList | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItemType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showCompleted, setShowCompleted] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    fetchList()
  }, [listId, user])

  const fetchList = async () => {
    try {
      const { data, error } = await supabase.from("shopping_lists").select("*").eq("id", listId).single()

      if (error) throw error
      setList(data)
    } catch (error) {
      console.error("Error fetching list:", error)
      router.push("/")
    }
  }

  const handleCreateItem = async (itemData: Omit<ShoppingItemType, "id" | "created_at" | "updated_at">) => {
    await createItem(itemData)
  }

  const handleUpdateItem = async (itemData: Omit<ShoppingItemType, "id" | "created_at" | "updated_at">) => {
    if (editingItem) {
      await updateItem(editingItem.id, itemData)
      setEditingItem(null)
    }
  }

  const openEditDialog = (item: ShoppingItemType) => {
    setEditingItem(item)
    setShowAddDialog(true)
  }

  const closeAddDialog = () => {
    setShowAddDialog(false)
    setEditingItem(null)
  }

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    const matchesCompleted = showCompleted || !item.is_completed

    return matchesSearch && matchesCategory && matchesCompleted
  })

  const completedItems = items.filter((item) => item.is_completed)
  const pendingItems = items.filter((item) => !item.is_completed)
  const completionPercentage = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0

  const categories = Array.from(new Set(items.map((item) => item.category)))

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{list?.name || "Cargando..."}</h1>
                {list?.description && <p className="text-gray-400 text-sm">{list.description}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(true)}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              {items.length} productos
            </Badge>
            <Badge variant="secondary" className="bg-green-900 text-green-300">
              {completedItems.length} completados
            </Badge>
            <Badge variant="secondary" className="bg-blue-900 text-blue-300">
              {completionPercentage}% progreso
            </Badge>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className={`${
                showCompleted
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-gray-700 border-gray-600 hover:bg-gray-600"
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showCompleted ? "Ocultar completados" : "Mostrar completados"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Cargando productos...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <div className="text-gray-400">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {items.length === 0 ? "Lista vacía" : "No se encontraron productos"}
                </h3>
                <p>
                  {items.length === 0
                    ? "Agrega tu primer producto para comenzar"
                    : "Intenta cambiar los filtros de búsqueda"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Pending Items */}
            {pendingItems
              .filter(
                (item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (filterCategory === "all" || item.category === filterCategory),
              )
              .map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggleComplete={toggleComplete}
                  onEdit={openEditDialog}
                  onDelete={deleteItem}
                />
              ))}

            {/* Completed Items */}
            {showCompleted &&
              completedItems.filter(
                (item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (filterCategory === "all" || item.category === filterCategory),
              ).length > 0 && (
                <>
                  <div className="flex items-center space-x-2 mt-8 mb-4">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-400 text-sm">Completados</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                  {completedItems
                    .filter(
                      (item) =>
                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (filterCategory === "all" || item.category === filterCategory),
                    )
                    .map((item) => (
                      <ShoppingItem
                        key={item.id}
                        item={item}
                        onToggleComplete={toggleComplete}
                        onEdit={openEditDialog}
                        onDelete={deleteItem}
                      />
                    ))}
                </>
              )}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={closeAddDialog}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
        listId={listId}
        editingItem={editingItem}
      />

      {list && <ShareListDialog list={list} open={showShareDialog} onOpenChange={setShowShareDialog} />}
    </div>
  )
}
