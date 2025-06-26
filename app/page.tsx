"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, LogOut, User } from "lucide-react"
import { useShoppingLists } from "@/hooks/use-shopping-lists"
import { ShoppingListCard } from "@/components/shopping-list/shopping-list-card"
import type { ShoppingList } from "@/types/database"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const { lists, loading, createList, updateList, deleteList } = useShoppingLists()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingList, setEditingList] = useState<ShoppingList | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const handleCreateList = async () => {
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      await createList(formData.name, formData.description)
      setFormData({ name: "", description: "" })
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Error creating list:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditList = async () => {
    if (!editingList || !formData.name.trim()) return

    setSaving(true)
    try {
      await updateList(editingList.id, {
        name: formData.name,
        description: formData.description,
      })
      setFormData({ name: "", description: "" })
      setEditingList(null)
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Error updating list:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteList = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta lista?")) {
      await deleteList(id)
    }
  }

  const openEditDialog = (list: ShoppingList) => {
    setEditingList(list)
    setFormData({ name: list.name, description: list.description || "" })
    setShowCreateDialog(true)
  }

  const closeDialog = () => {
    setShowCreateDialog(false)
    setEditingList(null)
    setFormData({ name: "", description: "" })
  }

  const handleListClick = (list: ShoppingList) => {
    router.push(`/list/${list.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Lista de Compras</h1>
            <p className="text-gray-400">¡Hola, {profile?.full_name || user.email}!</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-gray-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Mis Listas</h2>
            <p className="text-gray-400">Organiza y comparte tus listas de compras</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={closeDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Lista
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>{editingList ? "Editar Lista" : "Crear Nueva Lista"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingList
                    ? "Modifica los detalles de tu lista"
                    : "Crea una nueva lista de compras para organizar tus productos"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="list-name" className="text-gray-200">
                    Nombre de la lista
                  </Label>
                  <Input
                    id="list-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Compras del supermercado"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="list-description" className="text-gray-200">
                    Descripción (opcional)
                  </Label>
                  <Textarea
                    id="list-description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el propósito de esta lista..."
                    className="bg-gray-800 border-gray-700 text-white resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingList ? handleEditList : handleCreateList}
                    disabled={saving || !formData.name.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? "Guardando..." : editingList ? "Actualizar" : "Crear Lista"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lists Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Cargando listas...</div>
          </div>
        ) : lists.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-2">No tienes listas aún</h3>
                <p>Crea tu primera lista de compras para comenzar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onEdit={openEditDialog}
                onDelete={handleDeleteList}
                onClick={handleListClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
