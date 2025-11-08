import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Opportunity from "@/lib/models/Opportunity"
import { getAuthFromRequest } from "@/lib/utils/auth"
import mongoose from "mongoose"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const opportunity = await Opportunity.findById(params.id)
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    const userId = new mongoose.Types.ObjectId(auth.userId)
    const isLiked = opportunity.likes.some(
      (likeId) => likeId.toString() === auth.userId
    )

    if (isLiked) {
      // Unlike
      opportunity.likes = opportunity.likes.filter(
        (likeId) => likeId.toString() !== auth.userId
      )
    } else {
      // Like
      opportunity.likes.push(userId)
    }

    await opportunity.save()

    return NextResponse.json({
      liked: !isLiked,
      likesCount: opportunity.likes.length,
    })
  } catch (error: any) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: error.message || "Failed to toggle like" }, { status: 500 })
  }
}



