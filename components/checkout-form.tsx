"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast"
import { createOrder } from "@/lib/orders-backend"
import { useRouter } from "next/navigation"
import OrderConfirmationModal from "./order-confirmation-modal"
import {
  formatCardNumber,
  formatExpiryDate,
  formatCVV,
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  getCardType,
} from "@/lib/card-utils"

export default function CheckoutForm() {
  const { items, getTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [redirected, setRedirected] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderConfirmationData, setOrderConfirmationData] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && !redirected) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      }))
    }
  }, [user, redirected])

  useEffect(() => {
    if (!user && !redirected) {
      setRedirected(true)
      addToast("Por favor, inicia sesión para completar tu compra", "error")
      router.push("/auth/login")
    }
  }, [user, redirected, router, addToast])

  const hasStockIssues = items.some((item) => item.stock <= 0)

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) errors.firstName = "El nombre es requerido"
    if (!formData.lastName.trim()) errors.lastName = "El apellido es requerido"
    if (!formData.email.trim()) errors.email = "El correo electrónico es requerido"
    if (!formData.address.trim()) errors.address = "La dirección es requerida"
    if (!formData.city.trim()) errors.city = "La ciudad es requerida"
    if (!formData.zipCode.trim()) errors.zipCode = "El código postal es requerido"

    if (!validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = "Por favor, introduce un número de tarjeta válido (13-19 dígitos)"
    }

    const expiryValidation = validateExpiryDate(formData.expiryDate)
    if (!expiryValidation.isValid) {
      errors.expiryDate = expiryValidation.message || "Fecha de vencimiento inválida"
    }

    if (!validateCVV(formData.cvv)) {
      errors.cvv = "Por favor, introduce un CVV válido (3-4 dígitos)"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "Por favor, introduce un correo electrónico válido"
    }

    const zipRegex = /^\d{5}(-\d{4})?$/
    if (formData.zipCode && !zipRegex.test(formData.zipCode)) {
      errors.zipCode = "Por favor, introduce un código postal válido (12345 o 12345-6789)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    switch (name) {
      case "cardNumber":
        formattedValue = formatCardNumber(value)
        break
      case "expiryDate":
        formattedValue = formatExpiryDate(value)
        break
      case "cvv":
        formattedValue = formatCVV(value)
        break
      case "zipCode":
        formattedValue = value.replace(/[^\d-]/g, "")
        break
      case "firstName":
      case "lastName":
      case "city":
        formattedValue = value.replace(/[^a-zA-Z\s]/g, "")
        break
    }

    setFormData({
      ...formData,
      [name]: formattedValue,
    })

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      addToast("Por favor, inicia sesión para completar tu compra", "error")
      router.push("/auth/login")
      return
    }

    if (hasStockIssues) {
      addToast("Algunos productos en tu carrito están agotados", "error")
      return
    }

    if (items.length === 0) {
      addToast("Tu carrito está vacío", "error")
      return
    }

    if (!validateForm()) {
      addToast("Por favor, corrige los errores en el formulario", "error")
      return
    }

    setIsProcessing(true)

    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      }

      console.log("Creating order with items:", items)
      const order = await createOrder(user.id, items, shippingAddress)

      if (order) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + 7)
        const estimatedDelivery = deliveryDate.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const confirmationData = {
          orderId: order.id,
          items: items,
          total: getTotal() + 9.99 + getTotal() * 0.08,
          shippingAddress,
          paymentMethod: {
            cardNumber: formData.cardNumber,
            cardType: getCardType(formData.cardNumber),
          },
          estimatedDelivery,
        }

        setOrderConfirmationData(confirmationData)
        setShowConfirmation(true)

        addToast(`¡Pedido realizado con éxito! ID del pedido: ${order.id.slice(0, 8)}`, "success")

        clearCart()
      } else {
        throw new Error("Error al crear el pedido")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      if (error instanceof Error) {
        addToast(error.message, "error")
      } else {
        addToast("No se pudo procesar el pedido. Por favor, inténtalo de nuevo.", "error")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    router.push("/profile")
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Inicio de Sesión Requerido</h2>
        <p className="text-gray-600 mb-8 dark:text-gray-300">Por favor, inicia sesión para completar tu compra.</p>
        <Button onClick={() => router.push("/auth/login")}>Ir al Inicio de Sesión</Button>
      </div>
    )
  }

  const total = getTotal() + 9.99 + getTotal() * 0.08
  const cardType = getCardType(formData.cardNumber)

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-in fade-in duration-500">            {hasStockIssues && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-4">
                <p className="text-red-600 font-medium dark:text-red-400">
                  ⚠️ Algunos productos en tu carrito están agotados. Por favor, elimínalos antes de continuar.
                </p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="dark:text-white">
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Dirección de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="dark:text-white">
                        Nombre *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.firstName ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="dark:text-white">
                        Apellido *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.lastName ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address" className="dark:text-white">
                      Dirección *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.address ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="dark:text-white">
                        Ciudad *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.city ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="dark:text-white">
                        Código Postal *
                      </Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        required
                        placeholder="12345 o 12345-6789"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.zipCode ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.zipCode && <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Información de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="dark:text-white">
                      Número de Tarjeta *
                    </Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength={19} // 16 digits + 3 spaces
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-20 ${
                          formErrors.cardNumber ? "border-red-500" : ""
                        }`}
                      />
                      {cardType !== "Unknown" && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{cardType}</span>
                        </div>
                      )}
                    </div>
                    {formErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="dark:text-white">
                        Fecha de Vencimiento *
                      </Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/AA"
                        required
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.expiryDate ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.expiryDate && <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="dark:text-white">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        required
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength={4}
                        className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.cvv ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.cvv && <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24 hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className={`dark:text-gray-300 ${item.stock <= 0 ? "text-red-500 line-through" : ""}`}>
                        {item.name} x {item.quantity}
                      </span>
                      <span className="dark:text-white">${((typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="dark:border-gray-600" />                    <div className="space-y-2">
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
                      <span className="dark:text-white">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full hover:scale-105 transition-transform"
                    size="lg"
                    disabled={isProcessing || hasStockIssues}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando pago...
                      </div>
                    ) : (
                      `Completar compra - $${total.toFixed(2)}`
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center dark:text-gray-400">
                    Tu información de pago está segura y encriptada
                  </p>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmation && orderConfirmationData && (
        <OrderConfirmationModal
          isOpen={showConfirmation}
          onClose={handleConfirmationClose}
          orderData={orderConfirmationData}
        />
      )}
    </>
  )
}
