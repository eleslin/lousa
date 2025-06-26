"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface AddItemInputProps {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
  disabled?: boolean
}

const categories = [
  { value: "fruits", label: "🍎 Frutas" },
  { value: "vegetables", label: "🥕 Verduras" },
  { value: "meat", label: "🥩 Carnes" },
  { value: "dairy", label: "🥛 Lácteos" },
  { value: "bakery", label: "🍞 Panadería" },
  { value: "pantry", label: "🥫 Despensa" },
  { value: "frozen", label: "🧊 Congelados" },
  { value: "cleaning", label: "🧽 Limpieza" },
  { value: "personal", label: "🧴 Personal" },
  { value: "other", label: "📦 Otros" },
]

export function AddItemInput({ onAdd, disabled }: AddItemInputProps) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState("other")
  const [adding, setAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || adding) return

    setAdding(true)
    try {
      await onAdd(name.trim(), quantity, category)
      setName("")
      setQuantity(1)
      setCategory("other")
    } finally {
      setAdding(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agregar producto..."
            className="bg-gray-900 border-gray-600 text-white"
            disabled={disabled || adding}
          />
        </div>
        <div className="w-20">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
            className="bg-gray-900 border-gray-600 text-white"
            disabled={disabled || adding}
          />
        </div>
        <div className="w-32">
          <Select value={category} onValueChange={setCategory} disabled={disabled || adding}>
            <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={!name.trim() || disabled || adding}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
