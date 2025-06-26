"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, RotateCcw, Trash2 } from "lucide-react"
import type { Database } from "@/types/database"

type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"]

interface ShoppingItemCardProps {
  item: ShoppingItem
  onComplete?: (id: string) => Promise<void>
  onRestore?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  showActions?: boolean
}

const categoryEmojis = {
  fruits: "🍎",
  vegetables: "🥕",
  meat: "🥩",
  dairy: "🥛",
  bakery: "🍞",
  pantry: "🥫",
  frozen: "🧊",
  cleaning: "🧽",
  personal: "🧴",
  other: "📦",
}

export function ShoppingItemCard({ item, onComplete, onRestore, onDelete, showActions = true }: ShoppingItemCardProps) {
  const [loading, setLoading] = useState(false)
  const isCompleted = item.status === "completed"

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true)
    try {
      await action()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        isCompleted ? "bg-gray-800/50 border-gray-700" : "bg-gray-800 border-gray-700 hover:bg-gray-750"
      }`}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <span className="text-2xl">{categoryEmojis[item.category as keyof typeof categoryEmojis] || "📦"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${isCompleted ? "line-through text-gray-500" : "text-white"}`}>
              {item.name}
            </span>
            {item.quantity > 1 && (
              <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                x{item.quantity}
              </Badge>
            )}
          </div>
          {isCompleted && item.completed_at && (
            <p className="text-xs text-gray-500 mt-1">Completado {new Date(item.completed_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center space-x-1">
          {!isCompleted && onComplete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onComplete(item.id))}
              disabled={loading}
              className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}

          {isCompleted && onRestore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onRestore(item.id))}
              disabled={loading}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {isCompleted && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onDelete(item.id))}
              disabled={loading}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
