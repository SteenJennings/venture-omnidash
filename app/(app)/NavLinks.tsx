"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/feed", label: "Feed" },
  { href: "/companies", label: "Companies" },
  { href: "/theses", label: "Theses" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center rounded px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--border)] text-[var(--text)]"
                  : "text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
