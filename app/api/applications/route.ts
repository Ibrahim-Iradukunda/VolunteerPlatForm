import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Application from "@/lib/models/Application"
import Opportunity from "@/lib/models/Opportunity"
import User from "@/lib/models/User"
import { getAuthFromRequest } from "@/lib/utils/auth"
import { sendEmail, generateApplicationEmail, generateStatusUpdateEmail } from "@/lib/utils/email"

// GET - Fetch applications
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const volunteerId = searchParams.get("volunteerId")
    const opportunityId = searchParams.get("opportunityId")
    const organizationId = searchParams.get("organizationId")
    const status = searchParams.get("status")

    let query: any = {}

    if (auth.role === "volunteer") {
      query.volunteerId = auth.userId
    } else if (auth.role === "organization") {
      // Get opportunities for this organization
      const opportunities = await Opportunity.find({ organizationId: auth.userId })
      const opportunityIds = opportunities.map((opp) => opp._id)
      query.opportunityId = { $in: opportunityIds }
    } else if (auth.role === "admin") {
      // Admin can see all
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (volunteerId) query.volunteerId = volunteerId
    if (opportunityId) query.opportunityId = opportunityId
    if (status) query.status = status

    const applications = await Application.find(query)
      .populate("volunteerId", "name email")
      .populate("opportunityId", "title organizationName")
      .sort({ appliedAt: -1 })
      .lean()

    return NextResponse.json({ applications })
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 })
  }
}

// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "volunteer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { opportunityId, message } = await request.json()

    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 })
    }

    // Check if opportunity exists
    const opportunity = await Opportunity.findById(opportunityId)
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      volunteerId: auth.userId,
      opportunityId,
    })

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied to this opportunity" }, { status: 400 })
    }

    // Get volunteer info
    const volunteer = await User.findById(auth.userId)
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 })
    }

    // Create application
    const application = await Application.create({
      volunteerId: auth.userId,
      volunteerName: volunteer.name,
      opportunityId,
      opportunityTitle: opportunity.title,
      message: message || "",
      status: "pending",
    })

    // Recalculate and update opportunity application count (real-time)
    const applicationCount = await Application.countDocuments({
      opportunityId,
    })
    opportunity.applications = applicationCount
    await opportunity.save()

    // Send email notification
    await sendEmail({
      to: volunteer.email,
      subject: "Application Submitted Successfully",
      html: generateApplicationEmail(volunteer.name, opportunity.title, opportunity.organizationName),
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: error.message || "Failed to create application" }, { status: 500 })
  }
}


