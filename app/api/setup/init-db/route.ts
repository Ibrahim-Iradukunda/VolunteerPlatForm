import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
import Opportunity from "@/lib/models/Opportunity"
import Application from "@/lib/models/Application"
import Comment from "@/lib/models/Comment"

/**
 * Database Initialization API Endpoint
 * 
 * This endpoint initializes the database with indexes.
 * It should be called once after deployment.
 * 
 * Security: In production, you should add authentication or a secret token
 * to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret token check for security
    const authHeader = request.headers.get("authorization")
    const secretToken = process.env.SETUP_SECRET_TOKEN
    
    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json(
        { error: "Unauthorized. Provide SETUP_SECRET_TOKEN in Authorization header." },
        { status: 401 }
      )
    }

    await connectDB()

    console.log("📊 Initializing database indexes...")

    // Create User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true })
    console.log("  ✓ User email index created")

    // Create Opportunity indexes
    try {
      await Opportunity.collection.createIndex(
        { title: "text", description: "text", location: "text" }
      )
      console.log("  ✓ Opportunity text search index created")
    } catch (error: any) {
      // Text index might already exist, that's okay
      if (!error.message.includes("already exists")) {
        console.warn("  ⚠ Text index creation warning:", error.message)
      }
    }
    
    await Opportunity.collection.createIndex({ organizationId: 1 })
    await Opportunity.collection.createIndex({ status: 1 })
    await Opportunity.collection.createIndex({ createdAt: -1 })
    console.log("  ✓ Opportunity indexes created")

    // Create Application indexes
    await Application.collection.createIndex(
      { volunteerId: 1, opportunityId: 1 },
      { unique: true }
    )
    await Application.collection.createIndex({ opportunityId: 1 })
    await Application.collection.createIndex({ volunteerId: 1 })
    await Application.collection.createIndex({ status: 1 })
    console.log("  ✓ Application indexes created")

    // Create Comment indexes
    await Comment.collection.createIndex({ opportunityId: 1 })
    await Comment.collection.createIndex({ volunteerId: 1 })
    await Comment.collection.createIndex({ createdAt: -1 })
    console.log("  ✓ Comment indexes created")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      indexes: {
        users: ["email (unique)"],
        opportunities: ["text search", "organizationId", "status", "createdAt"],
        applications: ["volunteerId + opportunityId (unique)", "opportunityId", "volunteerId", "status"],
        comments: ["opportunityId", "volunteerId", "createdAt"],
      },
    })
  } catch (error: any) {
    console.error("❌ Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize database",
      },
      { status: 500 }
    )
  }
}

