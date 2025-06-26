"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit } from "lucide-react"
import type { ShoppingItem } from "@/types/database"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<ShoppingItem, "id" | "created_at" | "updated_at">) => Promise<void>
  listId: string
  editingItem?: ShoppingItem | null
}

const categories = [
  { value: "fruits", label: "Frutas" },
  { value: "vegetables", label: "Verduras" },
  { value: "meat", label: "Carnes" },
  { value: "dairy", label: "Lácteos" },
  { value: "bakery", label: "Panadería" },
  { value: "pantry", label: "Despensa" },
  { value: "frozen", label: "Congelados" },
  { value: "cleaning", label: "Limpieza" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Otros" },
]

export function AddItemDialog({ open, onOpenChange, onSave, listId, editingItem }: AddItemDialogProps) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState("other")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDays, setRecurringDays] = useState(7)
  const [loading, setLoading] = useState(false)

  const isEditing = !!editingItem

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name)
      setQuantity(editingItem.quantity)
      setCategory(editingItem.category)
      setIsRecurring(editingItem.is_recurring)
      setRecurringDays(editingItem.recurring_days || 7)
    } else {
      setName("")
      setQuantity(1)
      setCategory("other")
      setIsRecurring(false)
      setRecurringDays(7)
    }
  }, [editingItem, open])

  const handleSave = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSave({
        list_id: listId,
        name: name.trim(),
        quantity,
        category,
        is_completed: editingItem?.is_completed || false,
        is_recurring: isRecurring,
        recurring_days: isRecurring ? recurringDays : null,
        last_added: new Date().toISOString(),
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? "Editar Producto" : "Agregar Producto"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing ? "Modifica los detalles del producto" : "Agrega un nuevo producto a tu lista"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Nombre del producto
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Leche, Pan, Manzanas..."
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-200">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-200">
                Categoría
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="recurring" className="text-gray-200">
                Producto recurrente
              </Label>
            </div>

            {isRecurring && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="recurringDays" className="text-gray-200">
                  Repetir cada (días)
                </Label>
                <Input
                  id="recurringDays"
                  type="number"
                  min="1"
                  max="365"
                  value={recurringDays}
                  onChange={(e) => setRecurringDays(Number.parseInt(e.target.value) || 7)}
                  className="bg-gray-800 border-gray-700 text-white w-24"
                />
                <p className="text-xs text-gray-400">
                  Este producto se agregará automáticamente cada {recurringDays} días
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading || !name.trim()} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
