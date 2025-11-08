import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
import { getAuthFromRequest } from "@/lib/utils/auth"
import mongoose from "mongoose"

// PUT - Verify or reject organization
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 })
    }

    const { verified } = await request.json()

    const user = await User.findByIdAndUpdate(
      params.id,
      { verified: verified === true },
      { new: true }
    )
      .select("-password")
      .lean()

    if (!user) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    if (user.role !== "organization") {
      return NextResponse.json({ error: "User is not an organization" }, { status: 400 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: error.message || "Failed to update organization" }, { status: 500 })
  }
}



