export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";

export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export function getHostnameFromHostHeader(hostHeader: string | null): string {
  const host = hostHeader ?? "";
  return host.split(":")[0] ?? "";
}

export function extractSubdomainFromHostname(hostname: string): string | null {
  const rootDomainBase = rootDomain.split(":")[0];

  // localhost dev: support foo.localhost and foo.localhost:3000
  if (hostname.includes("localhost")) {
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "localhost") {
      return parts[0] ?? null;
    }
    return null;
  }

  if (
    hostname !== rootDomainBase &&
    hostname !== `www.${rootDomainBase}` &&
    hostname.endsWith(`.${rootDomainBase}`)
  ) {
    return hostname.replace(`.${rootDomainBase}`, "");
  }

  return null;
}
