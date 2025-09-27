import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { db } from "@/server/db";
import { logUserAction, ActionType } from "@/lib/logging";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Get user's current account info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          where: { provider: "credentials" }, // Only credential accounts have passwords
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a credential account (password-based)
    const credentialAccount = user.accounts.find(
      (account) => account.provider === "credentials",
    );

    if (!credentialAccount) {
      // User is using email/magic link authentication, so they don't have a password to change
      return NextResponse.json(
        {
          error: "Password change not available for email-based authentication",
        },
        { status: 400 },
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      credentialAccount.refresh_token ?? "",
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in the account record
    await db.account.update({
      where: { id: credentialAccount.id },
      data: {
        refresh_token: hashedPassword,
      },
    });

    await logUserAction({
      action: ActionType.UPDATE,
      resource: "password",
      resourceId: session.user.id,
      request,
      success: true,
    });

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    await logUserAction({
      action: ActionType.UPDATE,
      resource: "password",
      request,
      success: false,
      metadata: { stage: "PUT password" },
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
