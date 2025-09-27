import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { Navbar } from "@/components/ui/navbar";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "EzMR - Easy Medical Records",
  description: "Streamline your medical record management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthSessionProvider>
            <Navbar />
            <main className="container mx-auto max-w-7xl px-6 py-8">
              <div className="brutalist-section bg-background border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
                {children}
              </div>
            </main>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
