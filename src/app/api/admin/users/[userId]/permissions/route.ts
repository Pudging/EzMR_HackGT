import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdminApi } from "@/lib/admin";

interface Params {
  userId: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await requireAdminApi();
    const { userId } = await params;
    const body = (await request.json()) as {
      permissions?: string[];
    };

    if (!Array.isArray(body.permissions)) {
      return NextResponse.json(
        { error: "permissions must be an array of strings" },
        { status: 400 },
      );
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { permissions: body.permissions },
      select: { id: true, permissions: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return NextResponse.json(
      { error: "Failed to update permissions" },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await requireAdminApi();
    const { userId } = await params;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, permissions: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ permissions: user.permissions ?? [] });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}
