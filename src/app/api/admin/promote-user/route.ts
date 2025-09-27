import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    // Require admin access
    await requireAdminApi();

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 },
      );
    }

    if (!["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 },
      );
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: role as "USER" | "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
