import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

function getJWTSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    throw new Error("Please define the JWT_SECRET environment variable inside .env.local")
  }
  return JWT_SECRET
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function getAuthFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

