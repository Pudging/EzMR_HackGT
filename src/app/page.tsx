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
        <div className="border-b-4 border-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="border-l-4 border-white pl-8">
              <h1 
                className="mb-4 text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {tenant?.hospitalName ?? "EzMR"}
              </h1>
              <p 
                className="text-xl text-neutral-300 uppercase tracking-wide drop-shadow-lg"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
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
                className="border-4 border-white p-8 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
              >
                <p 
                  className="text-white text-xl mb-6 drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                  Welcome back, {session.user?.name || "User"}. Access your tools.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/dashboard">
                    <Button 
                      className="border-2 border-white bg-white text-black uppercase px-8 py-3 hover:bg-neutral-200"
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
                    className="border-2 border-white bg-transparent text-white uppercase px-8 py-3 hover:bg-white hover:text-black"
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
                    className="border-4 border-white p-6 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                  >
                    <h3 
                      className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Patient Lookup
                    </h3>
                    <p 
                      className="text-neutral-300 text-sm drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Search for patients by ID, name, or scan their ID card to
                      access medical records.
                    </p>
                  </div>
                </Link>

                <Link href="/emr-upload">
                  <div 
                    className="border-4 border-white p-6 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                  >
                    <h3 
                      className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      EMR Upload
                    </h3>
                    <p 
                      className="text-neutral-300 text-sm drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Upload and manage electronic medical records with
                      AI-powered data extraction.
                    </p>
                  </div>
                </Link>

                <Link href="/id-scan">
                  <div 
                    className="border-4 border-white p-6 hover:border-opacity-80 transition-colors overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                  >
                    <h3 
                      className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      ID Scanner
                    </h3>
                    <p 
                      className="text-neutral-300 text-sm drop-shadow-lg"
                      style={{ 
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Scan patient's ID to automatically extract personal
                      information.
                    </p>
                  </div>
                </Link>

                <div 
                  className="border-4 border-white p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Medical Records
                  </h3>
                  <p 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    View and manage your medical history, prescriptions, and
                    test results.
                  </p>
                </div>

                <div 
                  className="border-4 border-white p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Appointments
                  </h3>
                  <p 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Schedule and track your upcoming medical appointments.
                  </p>
                </div>

                <div 
                  className="border-4 border-white p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Medications
                  </h3>
                  <p 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
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
                className="border-4 border-white p-8 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
              >
                <p 
                  className="text-white text-xl mb-6 drop-shadow-lg"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  Your personal medical record management system. Secure, simple,
                  and always accessible.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/auth/signin">
                    <Button 
                      className="border-2 border-white bg-white text-black uppercase px-8 py-3 hover:bg-neutral-200"
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
                    className="border-2 border-white bg-transparent text-white uppercase px-8 py-3 hover:bg-white hover:text-black"
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
                  className="border-4 border-white p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Secure & Private
                  </h3>
                  <p 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Your medical data is encrypted and only accessible by you.
                  </p>
                </div>

                <div 
                  className="border-4 border-white p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Always Accessible
                  </h3>
                  <p 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Access your records anywhere, anytime, on any device.
                  </p>
                </div>

                <div 
                  className="border-4 border-white p-6 overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                >
                  <h3 
                    className="mb-3 text-xl font-black uppercase tracking-wide text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    Lightning Fast
                  </h3>
                  <p 
                    className="text-neutral-300 text-sm drop-shadow-lg"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
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
