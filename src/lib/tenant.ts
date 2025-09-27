import { headers } from "next/headers";
import { db } from "@/server/db";
import {
  extractSubdomainFromHostname,
  getHostnameFromHostHeader,
} from "@/lib/domain";

export async function getCurrentTenant() {
  const hostHeader = (await headers()).get("host");
  const hostname = getHostnameFromHostHeader(hostHeader);
  const subdomain = extractSubdomainFromHostname(hostname);

  if (!subdomain) return null;

  const tenant = await db.tenant.findUnique({
    where: { subdomain },
    select: { id: true, subdomain: true, hospitalName: true },
  });

  return tenant ?? null;
}


