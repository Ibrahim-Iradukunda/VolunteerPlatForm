import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { createUser, findUserByEmail } from "@/lib/db/users"

/**
 * POST /api/admin/create
 * Creates an admin user in the SQLite database
 * This endpoint should be protected in production or removed after initial setup
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create admin user in SQLite database
    const userData = {
      email,
      password,
      name,
      role: "admin" as const,
      verified: true, // Admin users are automatically verified
    }

    const user = await createUser(userData)

    // Return user without password
    const { password: _, ...userResponse } = user

    return NextResponse.json(
      {
        user: userResponse,
        message: "Admin user created successfully in database",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create admin user" },
      { status: 500 }
    )
  }
}

