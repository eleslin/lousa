"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, LogOut, User, History, ShoppingCart } from "lucide-react"
import type { ShoppingList } from "@/types/database"
import { useRouter } from "next/navigation"
import { useSimpleShopping } from "@/hooks/use-simple-shopping"
import { useShoppingLists } from "@/hooks/use-shopping-lists"
import { ShoppingListCard } from "@/components/shopping-list/shopping-list-card"
import { ShoppingItemCard } from "@/components/shopping/shopping-item-card"

export default function HomePage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const {
    activeItems,
    historyItems,
    loading: itemsLoading,
    error,
    addItem,
    completeItem,
    restoreItem,
    deleteItem,
    shareList,
  } = useSimpleShopping()

  const [newItemName, setNewItemName] = useState("")

  // Handle errors and show them to the user
  useEffect(() => {
    if (error) {
      alert(error)
    }
  }, [error])

  const handleAddItem = async (itemName: string) => {
    console.log("Adding item:", itemName)
    if (!itemName.trim()) return
    try {
      console.log("Adding item:", itemName)
      await addItem(itemName)
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Error al agregar el artículo")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Lista de Compras</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={signOut} className="text-gray-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Activa</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Añadir nuevo artículo..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem(newItemName)
                  }
                }}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => handleAddItem(newItemName)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </div>

            <div className="space-y-4">
              {itemsLoading ? (
                <div className="text-center py-12 text-gray-400">Cargando productos...</div>
              ) : activeItems.length === 0 ? (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium text-white mb-2">Lista vacía</h3>
                    <p className="text-gray-400">Agrega tu primer producto arriba</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((item) => (
                    <ShoppingItemCard key={item.id} item={item} onComplete={completeItem} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {itemsLoading ? (
              <div className="text-center py-12 text-gray-400">Cargando histórico...</div>
            ) : historyItems.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-white mb-2">Sin histórico</h3>
                  <p className="text-gray-400">Los productos completados aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item) => (
                  <ShoppingItemCard key={item.id} item={item} onRestore={restoreItem} onDelete={deleteItem} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
