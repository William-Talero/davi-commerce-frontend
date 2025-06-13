"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, X } from "lucide-react"
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
  const [urlInput, setUrlInput] = useState(currentImageUrl || "")
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "")
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!urlInput.trim()) {
      return
    }

    try {
      new URL(urlInput)
      setPreviewUrl(urlInput)
      onImageSelected(urlInput)
    } catch (error) {
      console.error("Invalid URL:", error)
      }
  }

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
  }

  const handleImageUploaded = (url: string) => {
    setPreviewUrl(url)
    onImageSelected(url)
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    setUrlInput("")
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
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 break-all">
            URL: {previewUrl}
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "url")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir Archivo
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL de Imagen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImageUrl={currentImageUrl}
            />
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl" className="dark:text-white">
                    URL de la Imagen
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={urlInput}
                      onChange={handleUrlInputChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={!urlInput.trim()}
                      className="dark:border-gray-600 dark:text-white"
                    >
                      Usar URL
                    </Button>
                  </div>
                </div>
              </form>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Consejo:</strong> Puedes usar imágenes de servicios gratuitos como:
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 list-disc list-inside">
                  <li>Unsplash.com - Imágenes profesionales gratuitas</li>
                  <li>Pexels.com - Fotos de stock gratuitas</li>
                  <li>Pixabay.com - Imágenes libres de derechos</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}