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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <AuthSessionProvider>
            <Navbar />
            <main className="container mx-auto px-4">{children}</main>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
