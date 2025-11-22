import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findOpportunityById } from "@/lib/db/opportunities"
import { toggleLike } from "@/lib/db/likes"
import { getAuthFromRequest } from "@/lib/utils/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const opportunity = findOpportunityById(resolvedParams.id)
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    const result = toggleLike(resolvedParams.id, auth.userId)

    return NextResponse.json({
      liked: result.liked,
      likesCount: result.likesCount,
    })
  } catch (error: any) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: error.message || "Failed to toggle like" }, { status: 500 })
  }
}
