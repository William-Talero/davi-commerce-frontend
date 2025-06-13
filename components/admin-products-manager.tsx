"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast"
import { useRouter } from "next/navigation"
import Header from "./header"
import Footer from "./footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useProducts } from "@/lib/products-context"
import { createProduct, updateProduct, deleteProduct } from "@/lib/admin"
import HybridImageInput from "./hybrid-image-input"
import type { Product } from "@/lib/types"
import Image from "next/image"

export default function AdminProductsManager() {
  const { user, loading } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()
  const { products, isLoading, refreshProducts } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
    low_stock_threshold: "5",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
      return
    }

    if (user?.role === "admin" && products.length === 0) {
      refreshProducts()
    }
  }, [user, loading, router, products.length, refreshProducts])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageSelected = (imageUrl: string) => {
    setFormData({
      ...formData,
      image_url: imageUrl,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image_url) {
      addToast("Por favor, añade una imagen del producto", "error")
      return
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      stock: Number.parseInt(formData.stock),
      image_url: formData.image_url,
      low_stock_threshold: Number.parseInt(formData.low_stock_threshold),
    }

    let success = false

    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, productData)
      success = !!updated
      if (success) {
        addToast("¡Producto actualizado con éxito!", "success")
      }
    } else {
      const created = await createProduct(productData)
      success = !!created
      if (success) {
        addToast("¡Producto creado con éxito!", "success")
      }
    }

    if (success) {
      await refreshProducts()
      resetForm()
    } else {
      addToast("Error al guardar el producto", "error")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image_url: product.image_url,
      low_stock_threshold: (product.low_stock_threshold || 5).toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (product: Product) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      const success = await deleteProduct(product.id)
      if (success) {
        addToast("¡Producto eliminado con éxito!", "success")
        await refreshProducts()
      } else {
        addToast("Error al eliminar el producto", "error")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image_url: "",
      low_stock_threshold: "5",
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Gestión de Productos</h1>
            <p className="text-gray-600 dark:text-gray-300">Administra tu catálogo de productos e inventario</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 animate-in slide-in-from-top duration-300 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">{editingProduct ? "Editar Producto" : "Añadir Nuevo Producto"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <HybridImageInput onImageSelected={handleImageSelected} currentImageUrl={formData.image_url} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Producto *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Cantidad en Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="low_stock_threshold">Alerta de Stock Bajo</Label>
                    <Input
                      id="low_stock_threshold"
                      name="low_stock_threshold"
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingProduct ? "Actualizar Producto" : "Crear Producto"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 dark:text-white">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg line-clamp-1 dark:text-white">{product.name}</h3>
                      <Badge variant={product.stock <= (product.low_stock_threshold || 5) ? "destructive" : "default"}>
                        {product.stock} in stock
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2)}</span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product)} className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
