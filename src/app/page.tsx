import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { getCurrentTenant } from "@/lib/tenant";

export default async function HomePage() {
  const session = await auth();
  console.log("Home page session", session);
  const tenant = await getCurrentTenant();

  return (
    <main className="bg-background min-h-[calc(100vh-64px)]">
      {/* Main Content */}
      <div className="relative z-10 mx-auto px-0 py-16">
        <div className="text-center">
          <h1 className="text-foreground mb-6 text-5xl font-extrabold tracking-tight">
            Welcome to{" "}
            <span className="text-primary">
              {tenant?.hospitalName ?? "EzMR"}
            </span>
          </h1>

          {session ? (
            <div className="space-y-6">
              <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
                {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                Welcome back, {session.user?.name || "User"}! Ready to manage
                your medical records?
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-3">
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
                <Link href="/patient-lookup">
                  <MagicCard className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:scale-105">
                    <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                      🔍 Patient Lookup
                    </h3>
                    <p className="text-muted-foreground">
                      Search for patients by ID, name, or scan their ID card to
                      access medical records.
                    </p>
                  </MagicCard>
                </Link>

                <Link href="/emr-upload">
                  <MagicCard className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:scale-105">
                    <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                      📄 EMR Upload
                    </h3>
                    <p className="text-muted-foreground">
                      Upload and manage electronic medical records with
                      AI-powered data extraction.
                    </p>
                  </MagicCard>
                </Link>

                <Link href="/id-scan">
                  <MagicCard className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:scale-105">
                    <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                      📷 ID Scanner
                    </h3>
                    <p className="text-muted-foreground">
                      Scan patient's ID to automatically extract personal
                      information.
                    </p>
                  </MagicCard>
                </Link>

                <div className="bg-card rounded-xl border p-6 shadow-sm">
                  <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                    📋 Medical Records
                  </h3>
                  <p className="text-muted-foreground">
                    View and manage your medical history, prescriptions, and
                    test results.
                  </p>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm">
                  <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                    👨‍⚕️ Appointments
                  </h3>
                  <p className="text-muted-foreground">
                    Schedule and track your upcoming medical appointments.
                  </p>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm">
                  <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                    💊 Medications
                  </h3>
                  <p className="text-muted-foreground">
                    Keep track of your medications and set reminders.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
                Your personal medical record management system. Secure, simple,
                and always accessible.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/auth/signin">
                  <Button size="lg" className="px-8 py-3">
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
                  <div className="bg-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Secure & Private
                  </h3>
                  <p className="text-muted-foreground">
                    Your medical data is encrypted and only accessible by you.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Always Accessible
                  </h3>
                  <p className="text-muted-foreground">
                    Access your records anywhere, anytime, on any device.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
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
