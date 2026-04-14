"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
  },
  {
    href: "/feed",
    label: "Feed",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <rect x="1" y="2.5" width="13" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="1" y="6.75" width="9" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="1" y="11" width="11" height="1.5" rx="0.75" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/companies",
    label: "Companies",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M2 13V5l5-3 5 3v8H9.5v-3h-4v3H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
        <rect x="6" y="8.5" width="3" height="2.5" rx="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/founders",
    label: "Founders",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M2 13c0-3.036 2.462-5.5 5.5-5.5S13 9.964 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    href: "/theses",
    label: "Theses",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <rect x="2" y="1" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M5 5h5M5 7.5h5M5 10h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/deals",
    label: "Deals",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M2 2h11l-3 4.5H5L2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
        <path d="M5 6.5l-.5 6.5h6l-.5-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label, icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--border)] text-[var(--text)]"
                  : "text-[var(--muted)] hover:bg-[var(--border)]/60 hover:text-[var(--text)]"
              }`}
            >
              <span className={active ? "text-[var(--accent)]" : ""}>{icon}</span>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
