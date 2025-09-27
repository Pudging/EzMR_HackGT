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
    <div className="min-h-[calc(100vh-200px)]">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-foreground brutalist-text-shadow mb-8 text-6xl font-black tracking-tighter uppercase">
          WELCOME TO{" "}
          <span className="bg-primary text-primary-foreground inline-block -rotate-2 transform border-4 border-black px-4 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            {tenant?.hospitalName ?? "EZMR"}
          </span>
        </h1>

        {session ? (
          <div className="space-y-8">
            <div className="bg-secondary mx-auto max-w-4xl rotate-1 transform border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <p className="text-secondary-foreground text-2xl font-bold tracking-wide uppercase">
                {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                WELCOME BACK, {session.user?.name || "USER"}! READY TO MANAGE
                YOUR MEDICAL RECORDS?
              </p>
            </div>

            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="brutalist-button px-12 py-4 text-lg"
                >
                  GO TO DASHBOARD
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="brutalist-button bg-secondary text-secondary-foreground px-12 py-4 text-lg"
              >
                VIEW PROFILE
              </Button>
            </div>

            <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/patient-lookup" className="group">
                <div className="brutalist-card h-full transform p-8 transition-all duration-200 group-hover:rotate-1">
                  <div className="bg-primary text-primary-foreground mb-6 flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <span className="text-2xl font-black">🔍</span>
                  </div>
                  <h3 className="text-card-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                    PATIENT LOOKUP
                  </h3>
                  <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                    SEARCH FOR PATIENTS BY ID, NAME, OR SCAN THEIR ID CARD TO
                    ACCESS MEDICAL RECORDS.
                  </p>
                </div>
              </Link>

              <Link href="/emr-upload" className="group">
                <div className="brutalist-card h-full transform p-8 transition-all duration-200 group-hover:-rotate-1">
                  <div className="bg-primary text-primary-foreground mb-6 flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <span className="text-2xl font-black">📄</span>
                  </div>
                  <h3 className="text-card-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                    EMR UPLOAD
                  </h3>
                  <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                    UPLOAD AND MANAGE ELECTRONIC MEDICAL RECORDS WITH AI-POWERED
                    DATA EXTRACTION.
                  </p>
                </div>
              </Link>

              <Link href="/id-scan" className="group">
                <div className="brutalist-card h-full transform p-8 transition-all duration-200 group-hover:rotate-2">
                  <div className="bg-primary text-primary-foreground mb-6 flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <span className="text-2xl font-black">📷</span>
                  </div>
                  <h3 className="text-card-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                    ID SCANNER
                  </h3>
                  <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                    SCAN PATIENT'S ID TO AUTOMATICALLY EXTRACT PERSONAL
                    INFORMATION.
                  </p>
                </div>
              </Link>

              <div className="brutalist-card h-full transform p-8 transition-all duration-200 hover:-rotate-1">
                <div className="bg-secondary text-secondary-foreground mb-6 flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-2xl font-black">📋</span>
                </div>
                <h3 className="text-card-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                  MEDICAL RECORDS
                </h3>
                <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  VIEW AND MANAGE YOUR MEDICAL HISTORY, PRESCRIPTIONS, AND TEST
                  RESULTS.
                </p>
              </div>

              <div className="brutalist-card h-full transform p-8 transition-all duration-200 hover:rotate-1">
                <div className="bg-secondary text-secondary-foreground mb-6 flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-2xl font-black">👨‍⚕️</span>
                </div>
                <h3 className="text-card-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                  APPOINTMENTS
                </h3>
                <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  SCHEDULE AND TRACK YOUR UPCOMING MEDICAL APPOINTMENTS.
                </p>
              </div>

              <div className="brutalist-card h-full transform p-8 transition-all duration-200 hover:-rotate-2">
                <div className="bg-secondary text-secondary-foreground mb-6 flex h-16 w-16 items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-2xl font-black">💊</span>
                </div>
                <h3 className="text-card-foreground mb-4 text-2xl font-black tracking-tight uppercase">
                  MEDICATIONS
                </h3>
                <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  KEEP TRACK OF YOUR MEDICATIONS AND SET REMINDERS.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="bg-accent mx-auto max-w-4xl -rotate-1 transform border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <p className="text-accent-foreground text-center text-2xl font-black tracking-wide uppercase">
                YOUR PERSONAL MEDICAL RECORD MANAGEMENT SYSTEM. SECURE, SIMPLE,
                AND ALWAYS ACCESSIBLE.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  className="brutalist-button px-12 py-4 text-lg"
                >
                  GET STARTED
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="brutalist-button bg-secondary text-secondary-foreground px-12 py-4 text-lg"
              >
                LEARN MORE
              </Button>
            </div>

            <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-3">
              <div className="transform text-center transition-all duration-200 hover:rotate-2">
                <div className="bg-primary text-primary-foreground mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-3xl font-black">🔒</span>
                </div>
                <h3 className="text-foreground brutalist-text-shadow mb-4 text-2xl font-black tracking-tight uppercase">
                  SECURE & PRIVATE
                </h3>
                <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  YOUR MEDICAL DATA IS ENCRYPTED AND ONLY ACCESSIBLE BY YOU.
                </p>
              </div>

              <div className="transform text-center transition-all duration-200 hover:-rotate-2">
                <div className="bg-primary text-primary-foreground mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-3xl font-black">📱</span>
                </div>
                <h3 className="text-foreground brutalist-text-shadow mb-4 text-2xl font-black tracking-tight uppercase">
                  ALWAYS ACCESSIBLE
                </h3>
                <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  ACCESS YOUR RECORDS ANYWHERE, ANYTIME, ON ANY DEVICE.
                </p>
              </div>

              <div className="transform text-center transition-all duration-200 hover:rotate-1">
                <div className="bg-primary text-primary-foreground mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <span className="text-3xl font-black">⚡</span>
                </div>
                <h3 className="text-foreground brutalist-text-shadow mb-4 text-2xl font-black tracking-tight uppercase">
                  LIGHTNING FAST
                </h3>
                <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  QUICK ACCESS TO YOUR MEDICAL INFORMATION WHEN YOU NEED IT.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
