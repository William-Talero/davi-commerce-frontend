"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus, Minus, AlertTriangle } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8 dark:text-gray-300">¡Agrega algunos productos para comenzar!</p>
        <Link href="/products">
          <Button>Continuar Comprando</Button>
        </Link>
      </div>
    )
  }

  const hasStockIssues = items.some((item) => item.quantity > item.stock)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 dark:text-white">Carrito de compras</h1>

      {hasStockIssues && (
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <p className="text-orange-700 dark:text-orange-300 font-medium">
                Algunos productos en tu carrito exceden el stock disponible. Las cantidades han sido ajustadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => {
            const isOverStock = item.quantity > item.stock
            const maxQuantity = Math.min(item.stock, 10)

            return (
              <Card key={item.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4 sm:p-6">
                  {/* Mobile Layout (stacked) */}
                  <div className="flex flex-col space-y-3 sm:hidden">
                    <div className="flex items-start space-x-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow min-w-0 pr-2">
                        <h3 className="font-semibold dark:text-white text-sm leading-tight truncate">{item.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || '0').toFixed(2)}</p>
                        {isOverStock && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">Solo {item.stock} disponibles</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="dark:border-gray-600 h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center dark:text-white text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= maxQuantity}
                          className="dark:border-gray-600 h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold dark:text-white text-base">${((typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout (horizontal) */}
                  <div className="hidden sm:flex items-center space-x-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-semibold dark:text-white">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || '0').toFixed(2)}</p>
                      {isOverStock && (
                        <p className="text-sm text-orange-600 dark:text-orange-400">Solo {item.stock} disponibles</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="dark:border-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= maxQuantity}
                        className="dark:border-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold dark:text-white">${((typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')) * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Resumen de orden</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Subtotal</span>
                  <span className="dark:text-white">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Envío</span>
                  <span className="dark:text-white">$9.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Impuesto</span>
                  <span className="dark:text-white">${(getTotal() * 0.08).toFixed(2)}</span>
                </div>
                <hr className="dark:border-gray-600" />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">${(getTotal() + 9.99 + getTotal() * 0.08).toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full" size="lg" disabled={hasStockIssues}>
                  {hasStockIssues ? "Corregir problemas de stock" : "Proceder al pago"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
