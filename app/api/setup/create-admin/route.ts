import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"

/**
 * Create Admin User API Endpoint
 * 
 * This endpoint creates an admin user.
 * It should be called once after deployment.
 * 
 * Security: In production, you should add authentication or a secret token
 * to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret token check for security
    const authHeader = request.headers.get("authorization")
    const secretToken = process.env.SETUP_SECRET_TOKEN
    
    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json(
        { error: "Unauthorized. Provide SETUP_SECRET_TOKEN in Authorization header." },
        { status: 401 }
      )
    }

    await connectDB()

    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: `User with email ${email} already exists`,
          user: {
            email: existingAdmin.email,
            name: existingAdmin.name,
            role: existingAdmin.role,
          },
        },
        { status: 400 }
      )
    }

    // Create admin user
    const admin = await User.create({
      email,
      password, // Will be hashed by pre-save hook
      name,
      role: "admin",
    })

    // Return user without password
    const userResponse = admin.toObject()
    delete userResponse.password

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        user: userResponse,
        warning: "Please change the password after first login!",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create admin user",
      },
      { status: 500 }
    )
  }
}

