import Link from "next/link";
import { auth } from "@/server/auth";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getCurrentTenant } from "@/lib/tenant";

export default async function HomePage() {
  const session = await auth();
  const tenant = await getCurrentTenant();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            EzMR
          </span>
        </div>

        {session ? (
          <UserNav />
        ) : (
          <Link href="/auth/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
        )}
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {tenant?.hospitalName ?? "EzMR"}
            </span>
          </h1>

          {session ? (
            <div className="space-y-6">
              <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                Welcome back, {session.user?.name}! Ready to manage your medical
                records?
              </p>

              <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    📋 Medical Records
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    View and manage your medical history, prescriptions, and
                    test results.
                  </p>
                </div>

                <div className="rounded-xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    👨‍⚕️ Appointments
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Schedule and track your upcoming medical appointments.
                  </p>
                </div>

                <div className="rounded-xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                    💊 Medications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Keep track of your medications and set reminders.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
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
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Learn More
                </Button>
              </div>

              <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Secure & Private
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your medical data is encrypted and only accessible by you.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Always Accessible
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Access your records anywhere, anytime, on any device.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
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
