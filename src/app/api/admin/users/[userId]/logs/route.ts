import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { requireAdminApi } from "@/lib/admin";

interface Params {
  userId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await requireAdminApi();

    const { userId } = await params;
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const parsed = parseInt(limitParam ?? "20", 10);
    const base = Number.isNaN(parsed) ? 20 : parsed;
    const limit = Math.min(Math.max(base, 1), 100);

    const logs = await db.userActionLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        method: true,
        route: true,
        ip: true,
        userAgent: true,
        success: true,
        createdAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/admin/users/[userId]/logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
