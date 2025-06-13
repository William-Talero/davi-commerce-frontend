import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getUserOrders } from "@/lib/orders-backend"
import { extractUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Extract user from JWT token
    const user = extractUserFromRequest(request)
    
    // Get orders for the authenticated user only
    const orders = await getUserOrders(user.userId)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get user orders error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" }, 
      { status: 401 }
    )
  }
}

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
