import { auth } from "@/server/auth";

export default async function DebugAuthPage() {
  const session = await auth();

  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Auth Debug Page</h1>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-xl font-semibold">Session Data</h2>
            <pre className="bg-muted overflow-auto rounded p-4 text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-xl font-semibold">Session Status</h2>
            <div className="space-y-2">
              <p>
                <strong>Authenticated:</strong> {session ? "Yes" : "No"}
              </p>
              <p>
                <strong>User ID:</strong> {session?.user?.id ?? "N/A"}
              </p>
              <p>
                <strong>User Email:</strong> {session?.user?.email ?? "N/A"}
              </p>
              <p>
                <strong>User Name:</strong> {session?.user?.name ?? "N/A"}
              </p>
              <p>
                <strong>User Role:</strong> {session?.user?.role ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
