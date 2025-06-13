"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import ImageUpload from "./image-upload"
import Image from "next/image"

interface HybridImageInputProps {
  onImageSelected: (url: string) => void
  currentImageUrl?: string
  className?: string
}

export default function HybridImageInput({ 
  onImageSelected, 
  currentImageUrl, 
  className = "" 
}: HybridImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "")

  const handleImageUploaded = (url: string) => {
    setPreviewUrl(url)
    onImageSelected(url)
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    onImageSelected("")
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="dark:text-white">Imagen del Producto</Label>

      {previewUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden dark:border-gray-600">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Vista previa del producto"
              fill
              className="object-cover"
              onError={() => {
                console.error("Error loading image:", previewUrl)
                setPreviewUrl("")
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <ImageUpload
          onImageUploaded={handleImageUploaded}
          currentImageUrl={currentImageUrl}
        />
      )}
    </div>
  )
}