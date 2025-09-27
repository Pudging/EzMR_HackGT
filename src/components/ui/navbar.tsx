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
    <header className="bg-background sticky top-0 z-50 border-b-8 border-black shadow-[0_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[0_8px_0px_0px_rgba(255,255,255,1)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-foreground brutalist-text-shadow transform text-3xl font-black tracking-tighter uppercase transition-transform duration-150 hover:scale-105"
        >
          EZMR
        </Link>
        <ul className="flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`border-2 px-4 py-2 text-sm font-bold tracking-wider uppercase transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                      : "bg-secondary text-secondary-foreground border-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className="ml-4 list-none">
            <ModeToggle />
          </li>
          <li className="ml-2 list-none">
            {status === "loading" ? (
              <div className="bg-muted h-10 w-24 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]" />
            ) : session ? (
              <UserNav />
            ) : (
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="brutalist-button"
                >
                  SIGN IN
                </Button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
