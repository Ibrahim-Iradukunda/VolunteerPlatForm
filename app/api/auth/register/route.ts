import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
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

    // Check if user already exists
    const existingUser = await User.findOne({ email })
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

    const user = await User.create(userData)

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
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
    const userResponse = user.toObject()
    delete userResponse.password

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



