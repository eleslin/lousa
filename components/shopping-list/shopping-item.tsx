"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, RotateCcw } from "lucide-react"
import type { ShoppingItem as ShoppingItemType } from "@/types/database"

interface ShoppingItemProps {
  item: ShoppingItemType
  onToggleComplete: (id: string, isCompleted: string) => void
  onEdit: (item: ShoppingItemType) => void
  onDelete: (id: string) => void
}

const categoryColors = {
  fruits: "bg-green-900 text-green-300",
  vegetables: "bg-green-800 text-green-200",
  meat: "bg-red-900 text-red-300",
  dairy: "bg-blue-900 text-blue-300",
  bakery: "bg-yellow-900 text-yellow-300",
  pantry: "bg-purple-900 text-purple-300",
  frozen: "bg-cyan-900 text-cyan-300",
  cleaning: "bg-gray-800 text-gray-300",
  personal: "bg-pink-900 text-pink-300",
  other: "bg-gray-700 text-gray-300",
}

const categoryLabels = {
  fruits: "Frutas",
  vegetables: "Verduras",
  meat: "Carnes",
  dairy: "Lácteos",
  bakery: "Panadería",
  pantry: "Despensa",
  frozen: "Congelados",
  cleaning: "Limpieza",
  personal: "Personal",
  other: "Otros",
}

export function ShoppingItemComponent({ item, onToggleComplete, onEdit, onDelete }: ShoppingItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    try {
      await onToggleComplete(item.id, !item.completed_at ? "completed" : "active")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
        item.completed_at
          ? "bg-gray-800/50 border-gray-700 opacity-60"
          : "bg-gray-800 border-gray-700 hover:bg-gray-750"
      }`}
    >
      <Checkbox
        checked={item.completed_at ? true : false}
        onCheckedChange={handleToggleComplete}
        disabled={isUpdating}
        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${item.completed_at ? "line-through text-gray-500" : "text-white"}`}>
            {item.name}
          </span>
          {item.quantity > 1 && (
            <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
              x{item.quantity}
            </Badge>
          )}
          {/* {item.is_recurring && (
            <Badge variant="secondary" className="bg-blue-900 text-blue-300 text-xs">
              <RotateCcw className="w-3 h-3 mr-1" />
              Recurrente
            </Badge>
          )} */}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <Badge
            variant="secondary"
            className={`text-xs ${categoryColors[item.category as keyof typeof categoryColors] || categoryColors.other}`}
          >
            {categoryLabels[item.category as keyof typeof categoryLabels] || "Otros"}
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
          <DropdownMenuItem onClick={() => onEdit(item)} className="text-gray-200 hover:bg-gray-700">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-400 hover:bg-gray-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const ShoppingItem = ShoppingItemComponent
