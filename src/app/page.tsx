import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { getCurrentTenant } from "@/lib/tenant";

export default async function HomePage() {
  const session = await auth();
  const tenant = await getCurrentTenant();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {tenant?.hospitalName ?? "EzMR"}
            </span>
          </h1>

          {session ? (
            <div className="space-y-6">
              <p className="mx-auto max-w-3xl text-xl text-white/90">
                Welcome back, {session.user?.name}! Ready to manage your medical
                records?
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-white hover:from-blue-600 hover:to-indigo-700"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white px-8 py-3 font-semibold text-black hover:bg-black hover:bg-white hover:text-white"
                >
                  View Profile
                </Button>
              </div>

              <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-0 border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md">
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    📋 Medical Records
                  </h3>
                  <p className="text-white/80">
                    View and manage your medical history, prescriptions, and
                    test results.
                  </p>
                </div>

                <div className="rounded-xl border border-0 border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md">
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    👨‍⚕️ Appointments
                  </h3>
                  <p className="text-white/80">
                    Schedule and track your upcoming medical appointments.
                  </p>
                </div>

                <div className="rounded-xl border border-0 border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md">
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    💊 Medications
                  </h3>
                  <p className="text-white/80">
                    Keep track of your medications and set reminders.
                  </p>
                </div>

                <Link href="/id-scan" className="group">
                  <div className="rounded-xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:scale-105 hover:shadow-xl dark:bg-gray-800/80">
                    <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                      📷 ID Scanner
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Scan your ID to automatically extract personal
                      information.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="mx-auto max-w-3xl text-xl text-white/90">
                Your personal medical record management system. Secure, simple,
                and always accessible.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-white hover:from-blue-600 hover:to-indigo-700"
                  >
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white px-8 py-3 font-semibold text-black hover:bg-black hover:bg-white hover:text-white"
                >
                  Learn More
                </Button>
              </div>

              <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Secure & Private
                  </h3>
                  <p className="text-white/80">
                    Your medical data is encrypted and only accessible by you.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Always Accessible
                  </h3>
                  <p className="text-white/80">
                    Access your records anywhere, anytime, on any device.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Lightning Fast
                  </h3>
                  <p className="text-white/80">
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
