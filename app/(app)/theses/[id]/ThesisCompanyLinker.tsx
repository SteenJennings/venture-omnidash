"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Company = { id: string; name: string };

export default function ThesisCompanyLinker({
  thesisId,
  linkedIds,
}: {
  thesisId: string;
  linkedIds: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      setCompanies((data ?? []) as Company[]);
    }
    load();
  }, [supabase]);

  const unlinked = companies.filter((c) => !linkedIds.includes(c.id));

  async function handleLink(companyId: string) {
    setSaving(true);
    const res = await fetch("/api/thesis-companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thesis_id: thesisId, company_id: companyId }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (unlinked.length === 0) return null;

  return (
    <div className="mt-3">
      {open ? (
        <div className="flex items-center gap-2">
          <select
            defaultValue=""
            onChange={(e) => handleLink(e.target.value)}
            disabled={saving}
            className="flex-1 rounded-md border border-[var(--border-input)] bg-[var(--bg)] px-2 py-1.5 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="" disabled>
              Select company…
            </option>
            {unlinked.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        >
          + Link company
        </button>
      )}
    </div>
  );
}
