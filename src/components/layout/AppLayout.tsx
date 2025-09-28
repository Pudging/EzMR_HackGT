"use client";

import React from "react";
import WireframeDodecahedronBackground from "@/components/ui/WireframeDodecahedronBackground";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppLayout({
  children,
  className = "",
}: AppLayoutProps) {
  return (
    <main suppressHydrationWarning>
      <div className={`relative min-h-screen text-white ${className}`}>
        <WireframeDodecahedronBackground />
        <div className="relative z-10">{children}</div>
      </div>
    </main>
  );
}
