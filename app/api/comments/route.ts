import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Comment from "@/lib/models/Comment"
import Opportunity from "@/lib/models/Opportunity"
import User from "@/lib/models/User"
import { getAuthFromRequest } from "@/lib/utils/auth"
import mongoose from "mongoose"

// GET - Fetch comments for an opportunity
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get("opportunityId")

    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 })
    }

    const comments = await Comment.find({ opportunityId })
      .sort({ createdAt: -1 })
      .populate("volunteerId", "name email")
      .lean()

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch comments" }, { status: 500 })
  }
}

// POST - Create new comment
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "volunteer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { opportunityId, content } = await request.json()

    if (!opportunityId || !content) {
      return NextResponse.json({ error: "Opportunity ID and content are required" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "Comment too long (max 500 characters)" }, { status: 400 })
    }

    // Check if opportunity exists
    const opportunity = await Opportunity.findById(opportunityId)
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Get volunteer info
    const volunteer = await User.findById(auth.userId)
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 })
    }

    // Create comment
    const comment = await Comment.create({
      opportunityId,
      volunteerId: auth.userId,
      volunteerName: volunteer.name,
      content,
    })

    // Add comment to opportunity
    opportunity.comments.push(comment._id)
    await opportunity.save()

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: error.message || "Failed to create comment" }, { status: 500 })
  }
}



