import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findUserByEmail, comparePassword } from "@/lib/db/users"
import { generateToken } from "@/lib/utils/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await comparePassword(user, password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user without password
    const { password: _, ...userResponse } = user

    return NextResponse.json({
      user: userResponse,
      token,
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 })
  }
}
