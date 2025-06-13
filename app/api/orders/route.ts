import { type NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/orders-backend"

export async function POST(request: NextRequest) {
  try {
    const { userId, items, shippingAddress } = await request.json()

    if (!userId || !items || !shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const order = await createOrder(userId, items, shippingAddress)

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
