"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, CreditCard, MapPin, Calendar } from "lucide-react"
import { maskCardNumber } from "@/lib/card-utils"
import OrderDetailModal from "./order-detail-modal"
import type { CartItem, Order } from "@/lib/types"

interface OrderConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: {
    orderId: string
    items: CartItem[]
    total: number
    shippingAddress: {
      firstName: string
      lastName: string
      address: string
      city: string
      zipCode: string
      state?: string
      country?: string
    }
    paymentMethod: {
      cardNumber: string
      cardType: string
    }
    estimatedDelivery: string
  }
}

export default function OrderConfirmationModal({ isOpen, onClose, orderData }: OrderConfirmationModalProps) {
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  
  const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 9.99
  const tax = subtotal * 0.08

  const mockOrder: Order = {
    id: orderData.orderId,
    user_id: "",
    total_amount: orderData.total,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_delivery: orderData.estimatedDelivery,
    shipping_address: {
      first_name: orderData.shippingAddress.firstName,
      last_name: orderData.shippingAddress.lastName,
      address: orderData.shippingAddress.address,
      city: orderData.shippingAddress.city,
      state: orderData.shippingAddress.state || '',
      zip_code: orderData.shippingAddress.zipCode,
      country: orderData.shippingAddress.country || ''
    },
    payment_method: orderData.paymentMethod?.cardNumber ? `**** **** **** ${orderData.paymentMethod.cardNumber.slice(-4)}` : 'N/A',
    payment_status: "completed"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-green-600 dark:text-green-400">
            <CheckCircle className="mr-3 h-8 w-8" />
            ¡Pedido Confirmado!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary Header */}
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 dark:text-white">¡Gracias por tu compra!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tu pedido ha sido realizado con éxito y está siendo procesado.
                </p>
                <div className="flex justify-center items-center space-x-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Pedido #{orderData.orderId.slice(0, 8).toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2 dark:border-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {orderData.estimatedDelivery}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center dark:text-white">
                <Package className="mr-2 h-5 w-5" />
                Artículos ({orderData.items.length})
              </h4>
              <div className="space-y-3">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method */}
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center dark:text-white">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Método de Pago
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Tarjeta</p>
                  <p className="font-medium dark:text-white">{orderData.paymentMethod?.cardType || 'N/A'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Número de Tarjeta</p>
                  <p className="font-mono dark:text-white">{orderData.paymentMethod?.cardNumber ? maskCardNumber(orderData.paymentMethod.cardNumber) : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center dark:text-white">
                  <MapPin className="mr-2 h-5 w-5" />
                  Dirección de Envío
                </h4>
                <div className="space-y-1">
                  <p className="font-medium dark:text-white">
                    {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{orderData.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Total */}
          <Card className="dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 dark:text-white">Resumen del Pedido</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Subtotal</span>
                  <span className="dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Envío</span>
                  <span className="dark:text-white">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Impuesto</span>
                  <span className="dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <hr className="dark:border-gray-600" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="dark:text-white">Total</span>
                  <span className="text-green-600 dark:text-green-400">${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3 dark:text-white">¿Qué sigue?</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Recibirás un correo de confirmación en breve</li>
                <li>• Te enviaremos la información de seguimiento cuando tu pedido sea enviado</li>
                <li>• Entrega estimada: {orderData.estimatedDelivery}</li>
                <li>• Puedes hacer seguimiento a tu pedido en tu perfil</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onClose} className="flex-1">
              Continuar Comprando
            </Button>
            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-white" onClick={() => setShowOrderDetail(true)}>
              Ver Detalles del Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Order Detail Modal */}
      {showOrderDetail && (
        <OrderDetailModal 
          isOpen={showOrderDetail} 
          onClose={() => setShowOrderDetail(false)} 
          order={mockOrder} 
        />
      )}
    </Dialog>
  )
}
