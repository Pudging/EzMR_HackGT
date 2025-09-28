import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { getCurrentTenant } from "@/lib/tenant";
import AppLayout from "@/components/layout/AppLayout";

export default async function HomePage() {
  const session = await auth();
  console.log("Home page session", session);
  const tenant = await getCurrentTenant();

  return (
    <AppLayout>
      <main className="min-h-[calc(100vh-64px)]">
        {/* Hero Section */}
        <div className="border-b-4 border-foreground">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="border-l-4 border-foreground pl-8">
              <h1 
                className="mb-4 text-6xl font-black uppercase tracking-tight text-foreground drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: 'none'
                }}
              >
                EZMR
              </h1>
              <p 
                className="text-xl text-muted-foreground uppercase tracking-wide drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: 'none'
                }}
              >
                Medical Records System
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="mx-auto px-6 py-16">
          <div className="mx-auto max-w-6xl">

          {session ? (
            <div className="space-y-12">
              <div 
                className="border-4 border-foreground p-8 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
              >
                <p 
                  className="text-foreground text-xl mb-6 drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
                  {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                  Welcome back, {session.user?.name || "User"}. Access your tools.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/dashboard">
                    <Button 
                      className="border-2 border-foreground bg-foreground text-background uppercase px-8 py-3 hover:bg-foreground/90"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-2 border-foreground bg-transparent text-foreground uppercase px-8 py-3 hover:bg-foreground hover:text-background"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/patient-lookup">
                  <div 
                    className="border-4 border-foreground p-6 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                  >
                    <h3 
                      className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: 'none'
                      }}
                    >
                      Patient Lookup
                    </h3>
                    <p 
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: 'none'
                      }}
                    >
                      Search for patients by ID, name, or scan their ID card to
                      access medical records.
                    </p>
                  </div>
                </Link>

                <Link href="/emr-upload">
                  <div 
                    className="border-4 border-foreground p-6 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                  >
                    <h3 
                      className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: 'none'
                      }}
                    >
                      EMR Upload
                    </h3>
                    <p 
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: 'none'
                      }}
                    >
                      Upload and manage electronic medical records with
                      AI-powered data extraction.
                    </p>
                  </div>
                </Link>

                <Link href="/id-scan">
                  <div 
                    className="border-4 border-foreground p-6 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                  >
                    <h3 
                      className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: 'none'
                      }}
                    >
                      ID Scanner
                    </h3>
                    <p 
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: 'none'
                      }}
                    >
                      Scan patient's ID to automatically extract personal
                      information.
                    </p>
                  </div>
                </Link>

                <div 
                  className="border-4 border-foreground p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Medical Records
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    View and manage your medical history, prescriptions, and
                    test results.
                  </p>
                </div>

                <div 
                  className="border-4 border-foreground p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Appointments
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Schedule and track your upcoming medical appointments.
                  </p>
                </div>

                <div 
                  className="border-4 border-foreground p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Medications
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Keep track of your medications and set reminders.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div 
                className="border-4 border-foreground p-8 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
              >
                <p 
                  className="text-foreground text-xl mb-6 drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: 'none'
                  }}
                >
                  Your personal medical record management system. Secure, simple,
                  and always accessible.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/auth/signin">
                    <Button 
                      className="border-2 border-foreground bg-foreground text-background uppercase px-8 py-3 hover:bg-foreground/90"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                      }}
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-2 border-foreground bg-transparent text-foreground uppercase px-8 py-3 hover:bg-foreground hover:text-background"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div 
                  className="border-4 border-foreground p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Secure & Private
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Your medical data is encrypted and only accessible by you.
                  </p>
                </div>

                <div 
                  className="border-4 border-foreground p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Always Accessible
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Access your records anywhere, anytime, on any device.
                  </p>
                </div>

                <div 
                  className="border-4 border-foreground p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-foreground drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Lightning Fast
                  </h3>
                  <p 
                    className="text-muted-foreground text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: 'none'
                    }}
                  >
                    Quick access to your medical information when you need it.
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
