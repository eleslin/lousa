"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Share2, QrCode, Trash2, Edit } from "lucide-react"
import type { ShoppingList } from "@/types/database"
import { useShoppingItems } from "@/hooks/use-shopping-items"
import { ShareListDialog } from "./share-list-dialog"
import { QRCodeDialog } from "./qr-code-dialog"

interface ShoppingListCardProps {
  list: ShoppingList
  onEdit: (list: ShoppingList) => void
  onDelete: (id: string) => void
  onClick: (list: ShoppingList) => void
}

export function ShoppingListCard({ list, onEdit, onDelete, onClick }: ShoppingListCardProps) {
  const { items } = useShoppingItems(list.id)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)

  const completedItems = items.filter((item) => item.is_completed).length
  const totalItems = items.length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const handleCardClick = () => {
    onClick(list)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      <Card
        className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-white truncate">{list.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(list)
                }}
                className="text-gray-200 hover:bg-gray-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setShowShareDialog(true)
                }}
                className="text-gray-200 hover:bg-gray-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setShowQRDialog(true)
                }}
                className="text-gray-200 hover:bg-gray-700"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Código QR
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(list.id)
                }}
                className="text-red-400 hover:bg-gray-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {list.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{list.description}</p>}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                {totalItems} items
              </Badge>
              {totalItems > 0 && (
                <Badge
                  variant="secondary"
                  className={`${
                    completionPercentage === 100 ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"
                  }`}
                >
                  {completionPercentage}% completado
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareListDialog list={list} open={showShareDialog} onOpenChange={setShowShareDialog} />

      <QRCodeDialog list={list} open={showQRDialog} onOpenChange={setShowQRDialog} />
    </>
  )
}
