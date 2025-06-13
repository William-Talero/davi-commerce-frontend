import { type NextRequest } from "next/server"

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function extractUserFromRequest(request: NextRequest): JWTPayload {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization token')
  }
  
  const token = authHeader.substring(7)
  
  try {
    // Simple JWT decode (without signature verification for now)
    // In a production app, you should verify the signature
    const base64Payload = token.split('.')[1]
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
    
    if (!payload.userId || !payload.email) {
      throw new Error('Invalid token payload')
    }
    
    return payload as JWTPayload
  } catch (error) {
    throw new Error('Invalid or malformed token')
  }
}

export function isAdmin(user: JWTPayload): boolean {
  return user.role === 'admin'
}