import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findOpportunityById, updateOpportunity, deleteOpportunity } from "@/lib/db/opportunities"
import { countApplicationsByOpportunity } from "@/lib/db/applications"
import { findCommentsByOpportunityId } from "@/lib/db/comments"
import { findUserById } from "@/lib/db/users"
import { getAuthFromRequest } from "@/lib/utils/auth"
import { getLikesCount, isLiked } from "@/lib/db/likes"

// GET - Get single opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB()

    // Handle both sync and async params (Next.js 13+ vs 15+)
    const resolvedParams = await Promise.resolve(params)
    const opportunity = findOpportunityById(resolvedParams.id)

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Get organization info
    const organization = findUserById(opportunity.organizationId)
    
    // Get comments
    const comments = findCommentsByOpportunityId(opportunity.id)

    // Calculate real application count
    const applicationCount = countApplicationsByOpportunity(opportunity.id)

    // Get likes count
    const likesCount = getLikesCount(opportunity.id)

    // Check if current user liked it (if authenticated)
    const auth = getAuthFromRequest(request)
    let userLiked = false
    if (auth) {
      userLiked = isLiked(opportunity.id, auth.userId)
    }

    return NextResponse.json({
      opportunity: {
        ...opportunity,
        _id: opportunity.id, // For compatibility
        organizationId: {
          _id: organization?.id,
          orgName: organization?.orgName,
          email: organization?.email,
          contactInfo: organization?.contactInfo,
          description: organization?.description,
        },
        comments,
        applications: applicationCount,
        likes: Array(likesCount).fill(null).map((_, i) => `like-${i}`), // For compatibility with existing code
        likesCount,
        userLiked,
      },
    })
  } catch (error: any) {
    console.error("Error fetching opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch opportunity" }, { status: 500 })
  }
}

// PUT - Update opportunity
export async function PUT(
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

    // Check permissions: owner or admin
    if (
      opportunity.organizationId !== auth.userId &&
      auth.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const updated = updateOpportunity(resolvedParams.id, body)

    if (!updated) {
      return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 })
    }

    return NextResponse.json({ opportunity: { ...updated, _id: updated.id } })
  } catch (error: any) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to update opportunity" }, { status: 500 })
  }
}

// DELETE - Delete opportunity
export async function DELETE(
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

    // Check permissions: owner or admin
    if (
      opportunity.organizationId !== auth.userId &&
      auth.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    deleteOpportunity(resolvedParams.id)

    return NextResponse.json({ message: "Opportunity deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to delete opportunity" }, { status: 500 })
  }
}
