"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/lib/toast"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addToast } = useToast()

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      addToast("¡Producto agotado!", "error")
      return
    }

    addItem(product)
    addToast(`${product.name} añadido al carrito!`, "success")
  }

  const isLowStock = product.stock <= (product.low_stock_threshold || 5)
  const isOutOfStock = product.stock <= 0

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg">
                  Agotado
                </Badge>
              </div>
            )}
            {!isOutOfStock && isLowStock && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                ¡Solo quedan {product.stock}!
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2 dark:text-gray-300">{product.description}</p>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{product.stock} en inventario</span>
        </div>
        <Button
          onClick={handleAddToCart}
          size="sm"
          disabled={isOutOfStock}
          className="transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {isOutOfStock ? "Agotado" : "Añadir al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
