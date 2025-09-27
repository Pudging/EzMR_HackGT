import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { getCurrentTenant } from "@/lib/tenant";

export default async function HomePage() {
  const session = await auth();
  const tenant = await getCurrentTenant();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background">
      {/* Main Content */}
      <div className="relative z-10 mx-auto px-0 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground">
            Welcome to{" "}
            <span className="text-primary">
              {tenant?.hospitalName ?? "EzMR"}
            </span>
          </h1>

          {session ? (
            <div className="space-y-6">
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
                Welcome back, {session.user?.name}! Ready to manage your medical
                records?
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="px-8 py-3"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 font-semibold"
                >
                  View Profile
                </Button>
              </div>

              <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                    📋 Medical Records
                  </h3>
                  <p className="text-muted-foreground">
                    View and manage your medical history, prescriptions, and
                    test results.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                    👨‍⚕️ Appointments
                  </h3>
                  <p className="text-muted-foreground">
                    Schedule and track your upcoming medical appointments.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                    💊 Medications
                  </h3>
                  <p className="text-muted-foreground">
                    Keep track of your medications and set reminders.
                  </p>
                </div>

                <Link href="/id-scan" className="group">
                  <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 group-hover:scale-105">
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      📷 ID Scanner
                    </h3>
                    <p className="text-muted-foreground">
                      Scan your ID to automatically extract personal
                      information.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
                Your personal medical record management system. Secure, simple,
                and always accessible.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="px-8 py-3"
                  >
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 font-semibold"
                >
                  Learn More
                </Button>
              </div>

              <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-secondary">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Secure & Private
                  </h3>
                  <p className="text-muted-foreground">
                    Your medical data is encrypted and only accessible by you.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-secondary">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Always Accessible
                  </h3>
                  <p className="text-muted-foreground">
                    Access your records anywhere, anytime, on any device.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-secondary">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Lightning Fast
                  </h3>
                  <p className="text-muted-foreground">
                    Quick access to your medical information when you need it.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
