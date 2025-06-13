"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, MapPin, Calendar, CreditCard, User } from "lucide-react"
import { getOrderItems } from "@/lib/orders-backend"
import { useProducts } from "@/lib/products-context"
import type { Order, OrderItem } from "@/lib/types"
import Image from "next/image"

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const { getProduct } = useProducts()

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (order?.id) {
        setLoading(true)
        try {
          const items = await getOrderItems(order.id)
          setOrderItems(items)
        } catch (error) {
          console.error("Error fetching order items:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (isOpen && order) {
      fetchOrderItems()
    }
  }, [isOpen, order])

  const getProductInfo = (item: OrderItem) => {
    if (item.product) {
      return {
        name: item.product.name,
        image_url: item.product.image_url,
        category: 'Producto',
        showProductId: false
      }
    }
    
    const product = getProduct(item.product_id)
    if (product) {
      return {
        name: product.name,
        image_url: product.image_url,
        category: product.category,
        showProductId: false
      }
    }
    
    return {
      name: `Producto ${item.product_id.slice(-8)}`,
      image_url: null,
      category: 'Sin categoría',
      showProductId: true
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Package className="h-5 w-5" />
            Detalles de la Orden #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 dark:text-white">
                  <Calendar className="h-4 w-4" />
                  Información de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                  <Badge variant={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Fecha:</span>
                  <span className="text-sm dark:text-white">{new Date(order.created_at).toLocaleDateString("es-ES")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total:</span>
                  <span className="text-sm font-semibold dark:text-white">${order.total_amount.toFixed(2)}</span>
                </div>
                {order.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Entrega estimada:</span>
                    <span className="text-sm dark:text-white">
                      {new Date(order.estimated_delivery).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 dark:text-white">
                  <MapPin className="h-4 w-4" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm dark:text-white">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{order.shipping_address?.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{order.shipping_address?.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Package className="h-4 w-4" />
                Productos Ordenados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-300">Cargando productos...</p>
                </div>
              ) : orderItems.length > 0 ? (
                <div className="space-y-4">
                  {orderItems.map((item) => {
                    const productInfo = getProductInfo(item)
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg dark:border-gray-600">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                          <Image
                            src={productInfo.image_url || "/placeholder.svg"}
                            alt={productInfo.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium dark:text-white">{productInfo.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{productInfo.category}</p>
                          {productInfo.showProductId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {item.product_id}</p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold dark:text-white">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    )
                  })}
                  
                  <Separator className="dark:bg-gray-600" />
                  
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-semibold dark:text-white">Total de la Orden:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-300">No se encontraron productos para esta orden.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {order.payment_method && (
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 dark:text-white">
                  <CreditCard className="h-4 w-4" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm dark:text-white">{order.payment_method}</p>
                {order.payment_status && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Estado: <span className="capitalize">{order.payment_status}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}