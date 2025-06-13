"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/lib/toast"
import { useState } from "react"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, items } = useCart()
  const { addToast } = useToast()
  const [quantity, setQuantity] = useState(1)

  const cartItem = items.find((item) => item.id === product.id)
  const quantityInCart = cartItem ? cartItem.quantity : 0
  const availableStock = product.stock - quantityInCart
  const maxQuantity = Math.min(availableStock, 10)

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      addToast("¡Producto agotado!", "error")
      return
    }

    if (quantityInCart + quantity > product.stock) {
      addToast(`Solo quedan ${availableStock} unidades disponibles (${quantityInCart} ya en el carrito)`, "error")
      return
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }

    addToast(`${quantity} ${product.name}(s) añadido(s) al carrito!`, "success")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:h-screen md:pb-[6rem] md:items-center">
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
      </div>

      <div className="space-y-6">
        <div>
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-bold mb-4 dark:text-white">{product.name}</h1>
          <p className="text-gray-600 text-lg dark:text-gray-300">{product.description}</p>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2)}</span>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? `${product.stock} en inventario` : "Agotado"}
              </Badge>
            </div>

            {quantityInCart > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tienes {quantityInCart} de este artículo en tu carrito
                </p>
              </div>
            )}

            <div className="flex items-center space-x-4 mb-4">
              <label htmlFor="quantity" className="font-medium dark:text-white">
                Cantidad:
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded px-3 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={product.stock === 0 || maxQuantity === 0}
              >
                {maxQuantity === 0 ? (
                  <option value={0}>No hay más disponibles</option>
                ) : (
                  Array.from({ length: maxQuantity }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))
                )}
              </select>
              {maxQuantity < 10 && maxQuantity > 0 && (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  Solo quedan {availableStock} disponibles
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || maxQuantity === 0}
              className="w-full"
              size="lg"
            >
              {product.stock === 0 ? "Agotado" : maxQuantity === 0 ? "Máximo en Carrito" : "Añadir al Carrito"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
