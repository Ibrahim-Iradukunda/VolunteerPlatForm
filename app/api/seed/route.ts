import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import { findOpportunities } from "@/lib/db/opportunities"

// POST - Seed database (no longer creates hardcoded opportunities)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const existing = findOpportunities({})
    
    return NextResponse.json({ 
      message: "Seed endpoint available. No hardcoded opportunities will be created.",
      count: existing.length,
      note: "Opportunities must be created through the organization dashboard."
    })
  } catch (error: any) {
    console.error("Error checking database:", error)
    return NextResponse.json({ error: error.message || "Failed to check database" }, { status: 500 })
  }
}

// GET - Check if database needs seeding
export async function GET() {
  try {
    await connectDB()
    const existing = findOpportunities({})
    return NextResponse.json({ 
      needsSeeding: existing.length === 0,
      count: existing.length 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check database" }, { status: 500 })
  }
}

