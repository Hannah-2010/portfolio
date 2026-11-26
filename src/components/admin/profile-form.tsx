"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { btnPrimary, Empty } from "@/components/ui";
import { FieldInput, type DocOption, type Field } from "./fields";

const fields: Field[] = [
  { name: "full_name", label: "Full Name", required: true },
  { name: "title", label: "Professional Title" },
  { name: "about", label: "About Me", type: "textarea" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "location", label: "Location" },
  { name: "linkedin_url", label: "LinkedIn" },
  { name: "github_url", label: "GitHub" },
  { name: "avatar_document_id", label: "Profile Picture", type: "document", imageOnly: true },
  { name: "cv_document_id", label: "CV File", type: "document" },
];

export function ProfileForm() {
  const [supabase] = useState(() => createBrowserSupabase());
  const [values, setValues] = useState<Record<string, any> | null>(null);
  const [docs, setDocs] = useState<DocOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [p, d] = await Promise.all([
        supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
        supabase.from("documents").select("id,name,mime_type,visibility").order("name"),
      ]);
      setValues(p.data ?? {});
      setDocs((d.data ?? []) as DocOption[]);
    })();
  }, [supabase]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!values) return;
    setBusy(true);
    setMsg(null);
    const payload: Record<string, any> = { id: 1, updated_at: new Date().toISOString() };
    for (const f of fields) payload[f.name] = values[f.name] ?? (f.type === "document" ? null : "");
    const { error } = await supabase.from("profile").upsert(payload);
    if (error) setMsg({ ok: false, text: error.message });
    else {
      await supabase.from("activity_log").insert({ action: "Updated", entity: "Profile" });
      setMsg({ ok: true, text: "Saved." });
    }
    setBusy(false);
  }

  if (!values) return <Empty>Loading…</Empty>;

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      {fields.map((f) => (
        <FieldInput
          key={f.name}
          field={f}
          docs={docs}
          value={values[f.name]}
          onChange={(v) => setValues({ ...values, [f.name]: v })}
        />
      ))}
      {msg ? (
        <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-ink" : "text-rose-strong"}`}>
          {msg.text}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className={btnPrimary}>
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
