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
  { href: "/patient-lookup", label: "Patient Lookup" },
  { href: "/patient-assessment", label: "Patient Assessment" },
  { href: "/emr-upload", label: "EMR Upload" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground"
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
                  className={`text-xs transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
              <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
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
