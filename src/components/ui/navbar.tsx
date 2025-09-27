"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/patient-assessment", label: "Patient Assessment" },
  { href: "/auth/signin", label: "Sign In" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="border-b border-black bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-mono text-sm font-bold">
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
                    isActive ? "text-black" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
