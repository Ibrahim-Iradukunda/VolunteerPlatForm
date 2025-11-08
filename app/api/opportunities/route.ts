import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Opportunity from "@/lib/models/Opportunity"
import Application from "@/lib/models/Application"
import User from "@/lib/models/User"
import { getAuthFromRequest } from "@/lib/utils/auth"

// GET - Fetch all opportunities with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const accessibility = searchParams.get("accessibility")
    const status = searchParams.get("status") || "approved"
    const organizationId = searchParams.get("organizationId")

    let query: any = {}

    // Filter by status
    if (status !== "all") {
      query.status = status
    }

    // Filter by organization
    if (organizationId) {
      query.organizationId = organizationId
    }

    // Filter by type
    if (type && type !== "all") {
      query.type = type
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    // Filter by accessibility features
    if (accessibility) {
      query.accessibilityFeatures = { $in: [accessibility] }
    }

    // Search in title, description, location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { organizationName: { $regex: search, $options: "i" } },
      ]
    }

    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .populate("organizationId", "orgName email")
      .lean()

    // Calculate real application counts for each opportunity
    const opportunitiesWithCounts = await Promise.all(
      opportunities.map(async (opp) => {
        const applicationCount = await Application.countDocuments({
          opportunityId: opp._id,
        })
        return {
          ...opp,
          applications: applicationCount,
        }
      })
    )

    return NextResponse.json({ opportunities: opportunitiesWithCounts })
  } catch (error: any) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch opportunities" }, { status: 500 })
  }
}

// POST - Create new opportunity
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const auth = getAuthFromRequest(request)
    if (!auth || auth.role !== "organization") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(auth.userId)
    if (!user || !user.verified) {
      return NextResponse.json({ error: "Organization not verified" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      location,
      type,
      accessibilityFeatures,
      skills,
    } = body

    if (!title || !description || !location || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const opportunity = await Opportunity.create({
      organizationId: user._id,
      organizationName: user.orgName || user.name,
      title,
      description,
      requirements: requirements || [],
      location,
      type,
      accessibilityFeatures: accessibilityFeatures || [],
      skills: skills || [],
      status: "pending", // Requires admin approval
    })

    return NextResponse.json({ opportunity }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to create opportunity" }, { status: 500 })
  }
}


