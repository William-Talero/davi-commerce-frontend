import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "All fields are required" }, 
        { status: 400 }
      )
    }

    // For now, return a mock successful registration
    // This will be replaced with actual backend call when backend is running
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: "customer",
    }

    const mockToken = `mock-token-${Date.now()}`

    return NextResponse.json({
      success: true,
      data: {
        user: mockUser,
        accessToken: mockToken
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" }, 
      { status: 500 }
    )
  }
}