import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { findUserById, updateUser } from "@/lib/db/users";
import { getAuthFromRequest } from "@/lib/utils/auth";

// PUT - Verify or reject organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    const auth = getAuthFromRequest(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const user = findUserById(resolvedParams.id);
    if (!user) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (user.role !== "organization") {
      return NextResponse.json(
        { error: "User is not an organization" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { verified, rejected } = body;

    // Convert to boolean explicitly - handle both true and false
    let verifiedValue: boolean;
    if (typeof verified === "boolean") {
      verifiedValue = verified;
    } else if (verified === "true" || verified === true) {
      verifiedValue = true;
    } else {
      verifiedValue = false;
    }

    // Handle rejected field - if explicitly provided, use it; otherwise infer from verified
    let rejectedValue: boolean;
    if (rejected !== undefined) {
      rejectedValue = typeof rejected === "boolean" ? rejected : rejected === "true" || rejected === true;
    } else {
      // If not explicitly provided, set rejected = !verified
      rejectedValue = !verifiedValue;
    }

    const updated = updateUser(resolvedParams.id, {
      verified: verifiedValue,
      rejected: rejectedValue,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update organization" },
        { status: 500 }
      );
    }

    const { password: _, ...userResponse } = updated;

    return NextResponse.json({
      user: { ...userResponse, _id: userResponse.id },
    });
  } catch (error: any) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update organization" },
      { status: 500 }
    );
  }
}
