import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { protocol, rootDomain } from "@/lib/domain";
import { z } from "zod";

const schema = z.object({
  subdomain: z
    .string()
    .min(1, "Subdomain is required")
    .max(63, "Subdomain is too long")
    .regex(/^[a-z0-9-]+$/i, "Use letters, numbers, and dashes only")
    .transform((s) => s.toLowerCase()),
  hospitalName: z
    .string()
    .min(1, "Hospital name is required")
    .max(200, "Hospital name is too long"),
});

async function createTenant(formData: FormData) {
  "use server";

  const parsed = schema.safeParse({
    subdomain: formData.get("subdomain"),
    hospitalName: formData.get("hospitalName"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid input";
    redirect(`/admin/tenants/new?error=${encodeURIComponent(first)}`);
  }

  const { subdomain, hospitalName } = parsed.data;

  const existing = await db.tenant.findUnique({ where: { subdomain } });
  if (existing) {
    redirect(
      `/admin/tenants/new?error=${encodeURIComponent("Subdomain already exists")}`,
    );
  }

  await db.tenant.create({ data: { subdomain, hospitalName } });

  redirect(`${protocol}://${subdomain}.${rootDomain}`);
}

export default async function NewTenantPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl p-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          Register New Tenant
        </h1>

        {error ? (
          <div className="mb-4 rounded-md border-2 border-destructive bg-destructive/10 p-3 text-destructive">
            {error}
          </div>
        ) : null}

        <form action={createTenant} className="space-y-4">
          <div>
            <label
              htmlFor="subdomain"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subdomain
            </label>
            <div className="flex items-center gap-2">
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                required
                placeholder="acme"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              />
              <span className="text-gray-500 dark:text-gray-400">
                .{rootDomain}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lowercase letters, numbers, and dashes only.
            </p>
          </div>

          <div>
            <label
              htmlFor="hospitalName"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Hospital name
            </label>
            <input
              id="hospitalName"
              name="hospitalName"
              type="text"
              required
              placeholder="Acme General Hospital"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
            >
              Create tenant
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
