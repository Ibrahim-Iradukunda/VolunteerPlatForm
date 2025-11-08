import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Application from "@/lib/models/Application"
import Opportunity from "@/lib/models/Opportunity"
import User from "@/lib/models/User"
import { getAuthFromRequest } from "@/lib/utils/auth"
import { sendEmail, generateStatusUpdateEmail } from "@/lib/utils/email"
import mongoose from "mongoose"

// PUT - Update application status
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
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
    }

    const application = await Application.findById(params.id).populate("opportunityId")
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const opportunity = application.opportunityId as any

    // Check permissions: organization owner or admin
    if (auth.role === "organization") {
      if (opportunity.organizationId.toString() !== auth.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    application.status = status
    await application.save()

    // Send email notification to volunteer
    const volunteer = await User.findById(application.volunteerId)
    if (volunteer && (status === "accepted" || status === "rejected")) {
      await sendEmail({
        to: volunteer.email,
        subject: `Application ${status === "accepted" ? "Accepted" : "Update"}`,
        html: generateStatusUpdateEmail(
          volunteer.name,
          opportunity.title,
          status as "accepted" | "rejected"
        ),
      })
    }

    return NextResponse.json({ application })
  } catch (error: any) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 })
  }
}



