import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findUserById, deleteUser } from "@/lib/db/users"
import { getAuthFromRequest } from "@/lib/utils/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const user = await findUserById(resolvedParams.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 })
    }

    const success = await deleteUser(user.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 })
  }
}




