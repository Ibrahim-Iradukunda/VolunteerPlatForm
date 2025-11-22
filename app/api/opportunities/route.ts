import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findOpportunities, createOpportunity, updateOpportunityApplicationCount } from "@/lib/db/opportunities"
import { findUserById } from "@/lib/db/users"
import { countApplicationsByOpportunity } from "@/lib/db/applications"
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
    const statusParam = searchParams.get("status")
    // If status is "all" or not provided, return all opportunities (undefined = no filter)
    // Otherwise use the provided status, or default to "approved" for public views
    const status = statusParam === "all" ? undefined : (statusParam || "approved")
    const organizationId = searchParams.get("organizationId")

    const opportunities = findOpportunities({
      search: search || undefined,
      type: type || undefined,
      location: location || undefined,
      accessibility: accessibility || undefined,
      status: status,
      organizationId: organizationId || undefined,
    })

    // Calculate real application counts for each opportunity
    const opportunitiesWithCounts = opportunities.map((opp) => {
      const applicationCount = countApplicationsByOpportunity(opp.id)
      return {
        ...opp,
        _id: opp.id, // For compatibility
        applications: applicationCount,
      }
    })

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

    const user = findUserById(auth.userId)
    if (!user) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Check if organization is rejected
    if (user.rejected) {
      return NextResponse.json({ 
        error: "Your organization verification has been rejected. You cannot post opportunities. Please contact support for more information." 
      }, { status: 403 })
    }

    // Check if organization is verified
    if (!user.verified) {
      return NextResponse.json({ 
        error: "Organization not verified. Your organization must be verified by an admin before you can post opportunities." 
      }, { status: 403 })
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

    const opportunity = createOpportunity({
      organizationId: user.id,
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

    return NextResponse.json({ opportunity: { ...opportunity, _id: opportunity.id } }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json({ error: error.message || "Failed to create opportunity" }, { status: 500 })
  }
}
