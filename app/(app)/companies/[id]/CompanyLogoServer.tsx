"use client";

import { useState } from "react";

export default function CompanyLogoServer({
  name,
  website,
}: {
  name: string;
  website: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const domain = website
    ? website.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : null;
  const initial = name.charAt(0).toUpperCase();

  if (domain && !failed) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        width={44}
        height={44}
        onError={() => setFailed(true)}
        className="rounded-lg object-contain"
        style={{ width: 44, height: 44 }}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-raised)] text-[18px] font-semibold text-[var(--muted)]">
      {initial}
    </div>
  );
}
