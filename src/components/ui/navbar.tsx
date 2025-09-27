"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useSession } from "next-auth/react";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patient-assessment", label: "Patient Assessment" },
  { href: "/emr-upload", label: "EMR Upload" },
  { href: "/id-scan", label: "ID Scan" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-mono text-sm font-bold text-gray-900 dark:text-white"
        >
          EzMR
        </Link>
        <ul className="flex items-center gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-mono text-xs transition-colors ${
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className="ml-2 list-none">
            <ModeToggle />
          </li>
          <li className="list-none">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            ) : session ? (
              <UserNav />
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
