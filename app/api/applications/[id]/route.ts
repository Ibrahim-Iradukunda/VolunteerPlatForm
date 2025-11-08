import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findApplicationById, updateApplication } from "@/lib/db/applications"
import { findOpportunityById } from "@/lib/db/opportunities"
import { findUserById } from "@/lib/db/users"
import { getAuthFromRequest } from "@/lib/utils/auth"
import { sendEmail, generateStatusUpdateEmail } from "@/lib/utils/email"

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

    const application = findApplicationById(params.id)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const opportunity = findOpportunityById(application.opportunityId)
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Check permissions: organization owner or admin
    if (auth.role === "organization") {
      if (opportunity.organizationId !== auth.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updated = updateApplication(params.id, { status: status as "pending" | "accepted" | "rejected" })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
    }

    // Send email notification to volunteer
    const volunteer = findUserById(application.volunteerId)
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

    return NextResponse.json({ application: { ...updated, _id: updated.id } })
  } catch (error: any) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 })
  }
}
