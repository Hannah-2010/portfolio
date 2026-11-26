"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { btnDanger, btnOutline, btnPrimary, Card, Empty } from "@/components/ui";
import { FieldInput, type DocOption, type Field } from "./fields";

type Row = Record<string, any>;

export type DocLinkConfig = {
  type: "project_attachment" | "project_gallery" | "education" | "experience";
  label: string;
};

type Props = {
  table: string;
  singular: string;
  fields: Field[];
  titleKey: string;
  subtitleKeys?: string[];
  defaults?: Row;
  docLinks?: DocLinkConfig[];
  slugFrom?: string;
};

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";

export function ResourceManager({ table, singular, fields, titleKey, subtitleKeys = [], defaults = {}, docLinks = [], slugFrom }: Props) {
  const [supabase] = useState(() => createBrowserSupabase());
  const [rows, setRows] = useState<Row[]>([]);
  const [docs, setDocs] = useState<DocOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string | null; values: Row } | null>(null);
  const [linkSel, setLinkSel] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasVisible = fields.some((f) => f.name === "visible");

  const load = useCallback(async () => {
    const [r, d] = await Promise.all([
      supabase.from(table).select("*").order("sort_order"),
      supabase.from("documents").select("id,name,mime_type,visibility").order("name"),
    ]);
    if (r.error) setError(r.error.message);
    setRows(r.data ?? []);
    setDocs((d.data ?? []) as DocOption[]);
    setLoading(false);
  }, [supabase, table]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const log = (action: string, title: string) =>
    supabase.from("activity_log").insert({ action, entity: `${singular}: ${title}` });

  async function startEdit(row: Row | null) {
    setError(null);
    const values: Row = row ? { ...row } : { ...defaults, sort_order: rows.length + 1 };
    setEditing({ id: row?.id ?? null, values });
    const sel: Record<string, string[]> = {};
    for (const l of docLinks) {
      if (!row) {
        sel[l.type] = [];
        continue;
      }
      const { data } = await supabase
        .from("document_links")
        .select("document_id")
        .eq("entity_type", l.type)
        .eq("entity_id", row.id)
        .order("sort_order");
      sel[l.type] = (data ?? []).map((x) => x.document_id);
    }
    setLinkSel(sel);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError(null);
    const payload: Row = {};
    for (const f of fields) payload[f.name] = editing.values[f.name] ?? (f.type === "checkbox" ? false : f.type === "links" ? [] : "");
    payload.sort_order = Number(editing.values.sort_order ?? 0);
    for (const f of fields) if (f.type === "document" && payload[f.name] === "") payload[f.name] = null;

    let id = editing.id;
    if (id) {
      const { error: err } = await supabase.from(table).update(payload).eq("id", id);
      if (err) return fail(err.message);
    } else {
      if (slugFrom) payload.slug = `${slugify(String(payload[slugFrom]))}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error: err } = await supabase.from(table).insert(payload).select("id").single();
      if (err || !data) return fail(err?.message ?? "Could not save.");
      id = data.id;
    }

    for (const l of docLinks) {
      const wanted = linkSel[l.type] ?? [];
      const { data: existing } = await supabase
        .from("document_links")
        .select("document_id")
        .eq("entity_type", l.type)
        .eq("entity_id", id);
      const have = (existing ?? []).map((x) => x.document_id);
      const remove = have.filter((d) => !wanted.includes(d));
      if (remove.length) {
        await supabase.from("document_links").delete().eq("entity_type", l.type).eq("entity_id", id).in("document_id", remove);
      }
      const add = wanted.filter((d) => !have.includes(d));
      if (add.length) {
        await supabase
          .from("document_links")
          .insert(add.map((d) => ({ document_id: d, entity_type: l.type, entity_id: id, sort_order: wanted.indexOf(d) })));
      }
    }

    await log(editing.id ? "Updated" : "Created", String(payload[titleKey]));
    setEditing(null);
    setBusy(false);
    await load();

    function fail(msg: string) {
      setError(msg);
      setBusy(false);
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete "${row[titleKey]}"? This cannot be undone.`)) return;
    setError(null);
    await supabase.from("document_links").delete().eq("entity_id", row.id);
    const { error: err } = await supabase.from(table).delete().eq("id", row.id);
    if (err) return setError(err.message);
    await log("Deleted", String(row[titleKey]));
    await load();
  }

  async function toggleVisible(row: Row) {
    const { error: err } = await supabase.from(table).update({ visible: !row.visible }).eq("id", row.id);
    if (err) return setError(err.message);
    await log(row.visible ? "Hidden" : "Shown", String(row[titleKey]));
    await load();
  }

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-4">
        <h2 className="text-lg font-semibold">{editing.id ? `Edit ${singular}` : `New ${singular}`}</h2>
        {fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            docs={docs}
            value={editing.values[f.name]}
            onChange={(v) => setEditing({ ...editing, values: { ...editing.values, [f.name]: v } })}
          />
        ))}
        <FieldInput
          field={{ name: "sort_order", label: "Order", type: "number" }}
          docs={docs}
          value={editing.values.sort_order}
          onChange={(v) => setEditing({ ...editing, values: { ...editing.values, sort_order: v } })}
        />
        {docLinks.map((l) => (
          <fieldset key={l.type} className="rounded-md border border-rose-soft p-3">
            <legend className="px-1 text-sm font-medium">{l.label}</legend>
            {docs.length === 0 ? (
              <Empty>No documents yet. Upload files in Documents first.</Empty>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {docs.map((d) => (
                  <li key={d.id}>
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#a8545d]"
                        checked={(linkSel[l.type] ?? []).includes(d.id)}
                        onChange={(e) =>
                          setLinkSel({
                            ...linkSel,
                            [l.type]: e.target.checked
                              ? [...(linkSel[l.type] ?? []), d.id]
                              : (linkSel[l.type] ?? []).filter((x) => x !== d.id),
                          })
                        }
                      />
                      <span>
                        {d.name} <span className="text-muted">({d.visibility})</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        ))}
        {error ? (
          <p role="alert" className="text-sm text-rose-strong">
            {error}
          </p>
        ) : null}
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(null)} className={btnOutline}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <button type="button" onClick={() => startEdit(null)} className={btnPrimary}>
          Add {singular}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-rose-strong">
          {error}
        </p>
      ) : null}
      {loading ? (
        <Empty>Loading…</Empty>
      ) : rows.length === 0 ? (
        <Empty>No items yet.</Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{row[titleKey]}</p>
                  <p className="truncate text-sm text-muted">
                    {subtitleKeys.map((k) => row[k]).filter(Boolean).join(" · ")}
                    {hasVisible && !row.visible ? " · Hidden" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasVisible ? (
                    <button type="button" onClick={() => toggleVisible(row)} className={btnOutline}>
                      {row.visible ? "Hide" : "Show"}
                    </button>
                  ) : null}
                  <button type="button" onClick={() => startEdit(row)} className={btnOutline}>
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(row)} className={btnDanger}>
                    Delete
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
