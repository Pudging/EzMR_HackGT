import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 },
      );
    }

    const session = await auth();
    console.log("Bootstrap session:", session);

    if (!session?.user) {
      return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
    }

    // Check if there are any admin users
    const adminCount = await db.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Admin users already exist" },
        { status: 400 },
      );
    }

    // Make the current user an admin
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "You have been promoted to admin",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error bootstrapping admin:", error);
    return NextResponse.json(
      { error: "Failed to bootstrap admin user" },
      { status: 500 },
    );
  }
}
