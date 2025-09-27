import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { Navbar } from "@/components/ui/navbar";

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
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Navbar />
        <AuthSessionProvider>
          <main className="">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
