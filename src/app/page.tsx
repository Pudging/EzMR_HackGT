import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { getCurrentTenant } from "@/lib/tenant";
import AppLayout from "@/components/layout/AppLayout";
import { ExternalLink } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  console.log("Home page session", session);
  const tenant = await getCurrentTenant();

  return (
    <AppLayout>
      <main className="min-h-[calc(100vh-64px)]">
        {/* Hero Section */}
        <div className="border-foreground border-b-4">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="border-foreground border-l-4 pl-8">
              <h1
                className="text-foreground mb-4 text-6xl font-black tracking-tight uppercase drop-shadow-lg"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: "none",
                }}
              >
                EZMR
              </h1>
              <p
                className="text-muted-foreground text-xl tracking-wide uppercase drop-shadow-lg"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                  textShadow: "none",
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
                  className="border-foreground relative overflow-hidden border-4 p-8"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                  }}
                >
                  <p
                    className="text-foreground mb-6 text-xl drop-shadow-lg"
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: "none",
                    }}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                    Welcome back, {session.user?.name || "User"}. Access your
                    tools.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/patient-lookup">
                      <Button
                        className="border-foreground bg-foreground text-background hover:bg-foreground/90 border-2 px-8 py-3 uppercase hover:cursor-pointer"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath:
                            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                        }}
                      >
                        Go to Patient Lookup
                      </Button>
                    </Link>
                    <Link href="/emr-upload">
                      <Button
                        variant="outline"
                        className="border-foreground text-foreground hover:bg-foreground border-2 bg-transparent px-8 py-3 uppercase hover:cursor-pointer"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath:
                            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                        }}
                      >
                        Go to EMR Upload
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Link href="/patient-lookup">
                    <div
                      className="border-foreground hover:border-opacity-80 overflow-hidden border-4 p-6 transition-colors"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                      }}
                    >
                      <h3
                        className="text-foreground mb-3 flex items-baseline gap-2 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: "none",
                        }}
                      >
                        Patient Lookup <ExternalLink className="h-4 w-4" />
                      </h3>
                      <p
                        className="text-muted-foreground text-sm drop-shadow-lg"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: "none",
                        }}
                      >
                        Search for patients by ID, name, or scan their ID card
                        to access medical records.
                      </p>
                    </div>
                  </Link>

                  <Link href="/emr-upload">
                    <div
                      className="border-foreground hover:border-opacity-80 overflow-hidden border-4 p-6 transition-colors"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                      }}
                    >
                      <h3
                        className="text-foreground mb-3 flex items-baseline gap-2 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: "none",
                        }}
                      >
                        EMR Upload <ExternalLink className="h-4 w-4" />
                      </h3>
                      <p
                        className="text-muted-foreground text-sm drop-shadow-lg"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: "none",
                        }}
                      >
                        Upload and manage electronic medical records with
                        AI-powered data extraction.
                      </p>
                    </div>
                  </Link>

                  <Link href="/id-scan">
                    <div
                      className="border-foreground hover:border-opacity-80 overflow-hidden border-4 p-6 transition-colors"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                      }}
                    >
                      <h3
                        className="text-foreground mb-3 flex items-baseline gap-2 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: "none",
                        }}
                      >
                        ID Scanner <ExternalLink className="h-4 w-4" />
                      </h3>
                      <p
                        className="text-muted-foreground text-sm drop-shadow-lg"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          textShadow: "none",
                        }}
                      >
                        Scan patient's ID to automatically extract personal
                        information.
                      </p>
                    </div>
                  </Link>

                  <div
                    className="border-foreground overflow-hidden border-4 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                    }}
                  >
                    <h3
                      className="text-foreground mb-3 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Medical Records
                    </h3>
                    <p
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      View and manage your medical history, prescriptions, and
                      test results.
                    </p>
                  </div>

                  <div
                    className="border-foreground overflow-hidden border-4 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                    }}
                  >
                    <h3
                      className="text-foreground mb-3 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Appointments
                    </h3>
                    <p
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Schedule and track your upcoming medical appointments.
                    </p>
                  </div>

                  <div
                    className="border-foreground overflow-hidden border-4 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                    }}
                  >
                    <h3
                      className="text-foreground mb-3 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Medications
                    </h3>
                    <p
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
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
                  className="border-foreground relative overflow-hidden border-4 p-8"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
                  }}
                >
                  <p
                    className="text-foreground mb-6 text-xl drop-shadow-lg"
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                      textShadow: "none",
                    }}
                  >
                    Your personal medical record management system. Secure,
                    simple, and always accessible.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/auth/signin">
                      <Button
                        className="border-foreground bg-foreground text-background hover:bg-foreground/90 border-2 px-8 py-3 uppercase"
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                          clipPath:
                            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                        }}
                      >
                        Get Started
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-foreground text-foreground hover:bg-foreground hover:text-background border-2 bg-transparent px-8 py-3 uppercase"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        clipPath:
                          "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div
                    className="border-foreground overflow-hidden border-4 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                    }}
                  >
                    <h3
                      className="text-foreground mb-3 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Secure & Private
                    </h3>
                    <p
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Your medical data is encrypted and only accessible by you.
                    </p>
                  </div>

                  <div
                    className="border-foreground overflow-hidden border-4 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                    }}
                  >
                    <h3
                      className="text-foreground mb-3 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Always Accessible
                    </h3>
                    <p
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Access your records anywhere, anytime, on any device.
                    </p>
                  </div>

                  <div
                    className="border-foreground overflow-hidden border-4 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
                    }}
                  >
                    <h3
                      className="text-foreground mb-3 text-xl font-black tracking-wide uppercase drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
                      }}
                    >
                      Lightning Fast
                    </h3>
                    <p
                      className="text-muted-foreground text-sm drop-shadow-lg"
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, Consolas, "Roboto Mono", "Liberation Mono", "Courier New", monospace',
                        textShadow: "none",
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
