import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Opportunity from "@/lib/models/Opportunity"
import Application from "@/lib/models/Application"
import { getAuthFromRequest } from "@/lib/utils/auth"
import mongoose from "mongoose"

// GET - Get single opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid opportunity ID" }, { status: 400 })
    }

    const opportunity = await Opportunity.findById(params.id)
      .populate("organizationId", "orgName email contactInfo description")
      .populate("comments")
      .lean()

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Calculate real application count
    const applicationCount = await Application.countDocuments({
      opportunityId: params.id,
    })

    return NextResponse.json({
      opportunity: {
        ...opportunity,
        applications: applicationCount,
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

    // Check permissions: owner or admin
    if (
      opportunity.organizationId.toString() !== auth.userId &&
      auth.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const updated = await Opportunity.findByIdAndUpdate(params.id, body, {
      new: true,
    })

    return NextResponse.json({ opportunity: updated })
  } catch (error: any) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to update opportunity" }, { status: 500 })
  }
}

// DELETE - Delete opportunity
export async function DELETE(
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

    // Check permissions: owner or admin
    if (
      opportunity.organizationId.toString() !== auth.userId &&
      auth.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await Opportunity.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Opportunity deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to delete opportunity" }, { status: 500 })
  }
}


