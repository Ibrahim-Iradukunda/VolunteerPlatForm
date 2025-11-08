import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
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

    let query: any = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { orgName: { $regex: search, $options: "i" } },
      ]
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 })
  }
}



