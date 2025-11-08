import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findUsers } from "@/lib/db/users"
import { getAuthFromRequest } from "@/lib/utils/auth"

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const users = findUsers({
      role: role || undefined,
      search: search || undefined,
    })

    // Remove passwords
    const usersWithoutPasswords = users.map(({ password, ...user }) => ({
      ...user,
      _id: user.id, // For compatibility
    }))

    return NextResponse.json({ users: usersWithoutPasswords })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 })
  }
}
