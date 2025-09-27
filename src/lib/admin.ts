import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

// For use in API routes
export async function requireAdminApi() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }

  return session;
}

// For use in server components
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

export function isAdmin(role?: string) {
  return role === "ADMIN";
}
