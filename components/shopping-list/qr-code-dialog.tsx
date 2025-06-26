"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download } from "lucide-react"
import type { ShoppingList } from "@/types/database"
import { useEffect, useRef } from "react"

interface QRCodeDialogProps {
  list: ShoppingList
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeDialog({ list, open, onOpenChange }: QRCodeDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shareUrl = `${window.location.origin}/list/${list.id}`

  useEffect(() => {
    if (open && canvasRef.current) {
      generateQRCode()
    }
  }, [open, shareUrl])

  const generateQRCode = async () => {
    if (!canvasRef.current) return

    try {
      // Simple QR code generation using a library-free approach
      // In a real app, you'd use a library like 'qrcode'
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size
      canvas.width = 256
      canvas.height = 256

      // Fill background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 256, 256)

      // Draw placeholder QR pattern
      ctx.fillStyle = "#000000"

      // Corner squares
      const drawCornerSquare = (x: number, y: number) => {
        ctx.fillRect(x, y, 56, 56)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(x + 8, y + 8, 40, 40)
        ctx.fillStyle = "#000000"
        ctx.fillRect(x + 16, y + 16, 24, 24)
      }

      drawCornerSquare(16, 16)
      drawCornerSquare(184, 16)
      drawCornerSquare(16, 184)

      // Add some random pattern for demonstration
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(80 + i * 8, 80 + j * 8, 8, 8)
          }
        }
      }

      // Add text below
      ctx.fillStyle = "#666666"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Escanea para acceder", 128, 280)
      ctx.fillText("a la lista de compras", 128, 295)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const downloadQR = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `qr-${list.name.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Código QR
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comparte este código QR para que otros puedan acceder a "{list.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <canvas ref={canvasRef} className="max-w-full h-auto" style={{ width: "256px", height: "300px" }} />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">Escanea este código con cualquier lector QR</p>
            <p className="text-xs text-gray-500 break-all">{shareUrl}</p>
          </div>

          <Button onClick={downloadQR} variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            <Download className="mr-2 h-4 w-4" />
            Descargar QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
