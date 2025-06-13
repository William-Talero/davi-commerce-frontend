"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { validateImageFile, getImagePreview, uploadImageToBlob } from "@/lib/blob-utils"
import { useToast } from "@/lib/toast"
import Image from "next/image"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, currentImageUrl, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      addToast(validation.error || "Archivo inválido", "error")
      return
    }

    try {
      // Show preview immediately
      const preview = await getImagePreview(file)
      setPreviewUrl(preview)

      // Upload to Vercel Blob
      setIsUploading(true)
      const imageUrl = await uploadImageToBlob(file)

      // Notify parent component
      onImageUploaded(imageUrl)
      addToast("¡Imagen subida exitosamente!", "success")
    } catch (error) {
      console.error("Error uploading image:", error)
      addToast(error instanceof Error ? error.message : "Error al subir la imagen", "error")
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
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
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Subiendo...</p>
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
            }
            ${isUploading ? "pointer-events-none opacity-50" : ""}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500">
              {isUploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
              ) : (
                <ImageIcon className="w-full h-full" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium dark:text-white">
                {isUploading ? "Subiendo..." : "Subir Imagen del Producto"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Arrastra y suelta una imagen aquí, o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Soporta: JPG, PNG, GIF (máx 5MB)</p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="dark:border-gray-600 dark:text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Elegir Archivo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
