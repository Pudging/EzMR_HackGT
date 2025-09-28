import { type NextRequest } from "next/server";
import { Prisma, ActionType } from "@prisma/client";

import { db } from "@/server/db";
import { auth } from "@/server/auth/config";

export type LogUserActionParams = {
  action: ActionType;
  resource: string;
  resourceId?: string | null;
  success?: boolean;
  method?: string | null;
  route?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | undefined;
  request?: NextRequest | null;
};

function getIpFromRequest(
  request: NextRequest | null | undefined,
): string | null {
  if (!request) return null;
  const header =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (!header) return null;
  const first = header.split(",")[0]?.trim();
  return first?.length ? first : null;
}

function getUserAgentFromRequest(
  request: NextRequest | null | undefined,
): string | null {
  if (!request) return null;
  return request.headers.get("user-agent");
}

export async function logUserAction(
  params: LogUserActionParams,
): Promise<void> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const resolvedMethod = params.method ?? params.request?.method ?? null;
    const resolvedRoute =
      params.route ?? params.request?.nextUrl.pathname ?? null;
    const resolvedIp = params.ip ?? getIpFromRequest(params.request) ?? null;
    const resolvedUserAgent =
      params.userAgent ?? getUserAgentFromRequest(params.request) ?? null;

    const cleanMetadata = params.metadata
      ? Object.fromEntries(
          Object.entries(params.metadata).filter(
            ([, value]) => value !== undefined,
          ),
        )
      : undefined;

    await db.userActionLog.create({
      data: {
        userId: userId ?? undefined,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? undefined,
        success: params.success ?? true,
        method: resolvedMethod ?? undefined,
        route: resolvedRoute ?? undefined,
        ip: resolvedIp ?? undefined,
        userAgent: resolvedUserAgent ?? undefined,
        // metadata: cleanMetadata,
      },
    });
  } catch (error) {
     
    console.error("logUserAction error:", error);
  }
}

export { ActionType };
