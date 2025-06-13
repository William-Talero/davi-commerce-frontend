"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getUserOrders } from "@/lib/orders-backend"
import EditProfileModal from "./edit-profile-modal"
import OrderDetailModal from "./order-detail-modal"
import type { Order } from "@/lib/types"

export default function UserProfile() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    if (user) {
      setLoading(true)
      try {
        const userOrders = await getUserOrders()
        setOrders(userOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchOrders()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [fetchOrders, user])

  if (!user) {
    return <div className="dark:text-white">Por favor inicia sesión para ver tu perfil.</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default"
      case "processing":
        return "secondary"
      case "shipped":
        return "outline"
      case "delivered":
        return "default"
      default:
        return "default"
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="dark:text-white">Información del Perfil</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="flex items-center dark:border-gray-600 dark:text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="font-medium dark:text-white">Nombre</label>
            <p className="text-gray-600 dark:text-gray-300">
              {user.first_name} {user.last_name}
            </p>
          </div>
          <div>
            <label className="font-medium dark:text-white">Correo Electrónico</label>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
          <div>
            <label className="font-medium dark:text-white">Rol</label>
            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="ml-2">
              {user.role === "admin" ? "Administrador" : "Cliente"}
            </Badge>
          </div>
          {user.created_at && (
            <div>
              <label className="font-medium dark:text-white">Miembro Desde</label>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date(user.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dark:text-white">Historial de Pedidos</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="dark:border-gray-600 dark:text-white"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">Aún no tienes pedidos.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold dark:text-white">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold dark:text-white">${order.total_amount.toFixed(2)}</p>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-white" onClick={() => setSelectedOrder(order)}>
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={user} />}
      
      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          order={selectedOrder} 
        />
      )}
    </div>
  )
}
