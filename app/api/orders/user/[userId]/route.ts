import { type NextRequest, NextResponse } from "next/server"
import { getUserOrders } from "@/lib/orders-backend"
import { extractUserFromRequest } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authenticatedUser = extractUserFromRequest(request)
    
    if (authenticatedUser.userId !== params.userId && authenticatedUser.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized access to user orders" }, 
        { status: 403 }
      )
    }
    
    const orders = await getUserOrders(params.userId)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get user orders error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user orders" }, 
      { status: 401 }
    )
  }
}