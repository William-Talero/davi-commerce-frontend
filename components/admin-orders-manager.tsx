"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/admin";
import OrderDetailModal from "./order-detail-modal";
import type { Order } from "@/lib/types";

export default function AdminOrdersManager() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
      return;
    }

    if (user?.role === "admin") {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const ordersData = await getAllOrders();
    setOrders(ordersData);
    setIsLoading(false);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      addToast("¡Estado del pedido actualizado exitosamente!", "success");
      await fetchOrders();
    } else {
      addToast("Error al actualizar el estado del pedido", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "processing":
        return "secondary";
      case "shipped":
        return "outline";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const translateOrderStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getShippingAddressDisplay = (shippingAddress: any) => {
    if (!shippingAddress) {
      return {
        first_name: "",
        last_name: "",
        address: "",
        city: "",
        zip_code: "",
      };
    }

    // Handle case where shipping_address is a string (JSON)
    if (typeof shippingAddress === "string") {
      try {
        const parsed = JSON.parse(shippingAddress);
        return {
          first_name: parsed.firstName || parsed.first_name || "",
          last_name: parsed.lastName || parsed.last_name || "",
          address: parsed.address || "",
          city: parsed.city || "",
          zip_code: parsed.zipCode || parsed.zip_code || "",
        };
      } catch (error) {
        return {
          first_name: "",
          last_name: "",
          address: shippingAddress,
          city: "",
          zip_code: "",
        };
      }
    }

    // Special case: Check if the real data is in the 'street' field as JSON string
    if (shippingAddress.street && typeof shippingAddress.street === "string") {
      try {
        const parsed = JSON.parse(shippingAddress.street);
        return {
          first_name: parsed.firstName || parsed.first_name || "",
          last_name: parsed.lastName || parsed.last_name || "",
          address: parsed.address || "",
          city: parsed.city || "",
          zip_code: parsed.zipCode || parsed.zip_code || "",
        };
      } catch (error) {
        return {
          first_name: "",
          last_name: "",
          address: shippingAddress.street,
          city: shippingAddress.city || "",
          zip_code: shippingAddress.zipCode || shippingAddress.zip_code || "",
        };
      }
    }

    // Handle object format
    return {
      first_name: shippingAddress.firstName || shippingAddress.first_name || "",
      last_name: shippingAddress.lastName || shippingAddress.last_name || "",
      address: shippingAddress.address || "",
      city: shippingAddress.city || "",
      zip_code: shippingAddress.zipCode || shippingAddress.zip_code || "",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:text-white">
        Cargando...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ver y gestionar pedidos de clientes
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 dark:text-white">
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300">
                No se encontraron pedidos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg dark:text-white">
                        Pedido #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Badge variant={getStatusColor(order.status)}>
                        {translateOrderStatus(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 dark:text-white">
                        Dirección de Envío
                      </h4>
                      {(() => {
                        const addr = getShippingAddressDisplay(
                          order.shipping_address
                        );
                        return (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p>
                              {addr.first_name} {addr.last_name}
                            </p>
                            <p>{addr.address}</p>
                            <p>
                              {addr.city}
                              {addr.zip_code && `, ${addr.zip_code}`}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 dark:text-white">
                        Actualizar Estado
                      </h4>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(order.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">Procesando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 dark:border-gray-600 dark:text-white mt-5"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
