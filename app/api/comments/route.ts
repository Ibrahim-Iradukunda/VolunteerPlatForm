import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findCommentsByOpportunityId, createComment } from "@/lib/db/comments"
import { findOpportunityById } from "@/lib/db/opportunities"
import { findUserById } from "@/lib/db/users"
import { getAuthFromRequest } from "@/lib/utils/auth"

// GET - Fetch comments for an opportunity
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get("opportunityId")

    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 })
    }

    const comments = await findCommentsByOpportunityId(opportunityId)

    const commentsWithEmail = await Promise.all(
      comments.map(async comment => {
        const volunteer = await findUserById(comment.volunteerId)
        return {
          ...comment,
          _id: comment.id,
          volunteerName: comment.volunteerName,
          volunteerId: {
            _id: volunteer?.id,
            name: volunteer?.name || comment.volunteerName,
            email: volunteer?.email,
          },
        }
      })
    )

    return NextResponse.json({ comments: commentsWithEmail })
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
    const opportunity = await findOpportunityById(opportunityId)
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Get volunteer info
    const volunteer = await findUserById(auth.userId)
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 })
    }

    // Create comment
    const comment = await createComment({
      opportunityId,
      volunteerId: auth.userId,
      volunteerName: volunteer.name,
      content,
    })

    // Return comment with full structure matching GET response
    return NextResponse.json({ 
      comment: { 
        ...comment, 
        _id: comment.id,
        volunteerName: comment.volunteerName,
        volunteerId: {
          _id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
        },
      } 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: error.message || "Failed to create comment" }, { status: 500 })
  }
}
