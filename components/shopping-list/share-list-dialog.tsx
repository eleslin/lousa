"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Copy, MessageCircle } from "lucide-react"
import { shoppingListService } from "@/services/shopping-service"
import type { ShoppingList } from "@/types/database"
import { useToast } from "@/hooks/use-toast"

interface ShareListDialogProps {
  list: ShoppingList
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareListDialog({ list, open, onOpenChange }: ShareListDialogProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/list/${list.id}`

  const handleShareByEmail = async () => {
    if (!email.trim()) return

    setLoading(true)
    try {
      await shoppingListService.shareList(list.id, email)
      toast({
        title: "Lista compartida",
        description: `La lista ha sido compartida con ${email}`,
      })
      setEmail("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al compartir la lista",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado",
        description: "Enlace copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      })
    }
  }

  const shareViaWhatsApp = () => {
    const message = `¡Hola! Te comparto mi lista de compras "${list.name}". Puedes verla y editarla en tiempo real aquí: ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareMessage = `Lista de compras: ${list.name}\nAccede aquí: ${shareUrl}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Lista
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comparte "{list.name}" con otras personas para que puedan ver y editar en tiempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share by email */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-200">
              Compartir por email
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button
                onClick={handleShareByEmail}
                disabled={loading || !email.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Compartir
              </Button>
            </div>
          </div>

          {/* Share link */}
          <div className="space-y-3">
            <Label className="text-gray-200">Enlace directo</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="bg-gray-800 border-gray-700 text-white" />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(shareUrl)}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share message */}
          <div className="space-y-3">
            <Label className="text-gray-200">Mensaje para compartir</Label>
            <Textarea
              value={shareMessage}
              readOnly
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(shareMessage)}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar mensaje
              </Button>
              <Button onClick={shareViaWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
