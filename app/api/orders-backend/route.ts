import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getUserOrders, getAllOrders } from "@/lib/orders-backend"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let orders
    
    if (userId) {
      orders = await getUserOrders(userId)
    } else {
      // This would require admin authentication in a real app
      orders = await getAllOrders()
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, items, shippingAddress, notes } = await request.json()

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "User ID and items are required" }, 
        { status: 400 }
      )
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" }, 
        { status: 400 }
      )
    }

    const order = await createOrder(userId, items, shippingAddress)

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" }, 
      { status: 500 }
    )
  }
}