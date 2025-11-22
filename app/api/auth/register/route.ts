import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { createUser, findUserByEmail } from "@/lib/db/users"
import { generateToken } from "@/lib/utils/auth"
import { sendEmail, generateApplicationEmail } from "@/lib/utils/email"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password, name, role, ...additionalData } = body

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prevent admin role registration through public registration endpoint
    // Admin users must be created through the admin creation endpoint
    if (role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be created through registration" },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user based on role
    const userData: any = {
      email,
      password,
      name,
      role,
    }

    if (role === "volunteer") {
      userData.skills = additionalData.skills || []
      userData.availability = additionalData.availability || ""
      userData.disabilityStatus = additionalData.disabilityStatus || ""
      userData.accessibilityNeeds = additionalData.accessibilityNeeds || []
    } else if (role === "organization") {
      userData.orgName = additionalData.orgName || ""
      userData.contactInfo = additionalData.contactInfo || ""
      userData.description = additionalData.description || ""
      userData.verified = false // Requires admin approval
    }

    const user = await createUser(userData)

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Send welcome email (if configured)
    if (role === "volunteer") {
      await sendEmail({
        to: email,
        subject: "Welcome to Inclusive Volunteer Opportunities Finder",
        html: generateApplicationEmail(name, "Welcome", "Our Platform"),
      })
    }

    // Return user without password
    const { password: _, ...userResponse } = user

    return NextResponse.json(
      {
        user: userResponse,
        token,
        message: role === "organization" ? "Account created. Pending admin approval." : "Account created successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
