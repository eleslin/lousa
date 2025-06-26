"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Check } from "lucide-react"

interface ShareInputProps {
  onShare: (email: string) => Promise<void>
  disabled?: boolean
}

export function ShareInput({ onShare, disabled }: ShareInputProps) {
  const [email, setEmail] = useState("")
  const [sharing, setSharing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || sharing) return

    setSharing(true)
    try {
      await onShare(email.trim())
      setEmail("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } finally {
      setSharing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email para compartir..."
          className="bg-gray-800 border-gray-700 text-white"
          disabled={disabled || sharing}
        />
      </div>
      <Button
        type="submit"
        disabled={!email.trim() || disabled || sharing}
        className={success ? "bg-green-600 hover:bg-green-700" : "bg-violet-600 hover:bg-violet-700"}
      >
        {success ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      </Button>
    </form>
  )
}
