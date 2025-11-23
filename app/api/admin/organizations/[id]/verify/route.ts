import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findUserById, updateUser } from "@/lib/db/users"
import { getAuthFromRequest } from "@/lib/utils/auth"

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

    const user = findUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    if (user.role !== "organization") {
      return NextResponse.json({ error: "User is not an organization" }, { status: 400 })
    }

    const { verified } = await request.json()

    const updated = updateUser(params.id, { verified: verified === true })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update organization" }, { status: 500 })
    }

    const { password: _, ...userResponse } = updated

    return NextResponse.json({ user: { ...userResponse, _id: userResponse.id } })
  } catch (error: any) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: error.message || "Failed to update organization" }, { status: 500 })
  }
}
