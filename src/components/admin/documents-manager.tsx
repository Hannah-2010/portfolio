"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { btnDanger, btnOutline, btnPrimary, Empty, inputCls } from "@/components/ui";

type Folder = { id: string; name: string };
type Doc = {
  id: string;
  folder_id: string | null;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  visibility: "public" | "private";
  created_at: string;
};

const ALLOWED = ["pdf", "docx", "pptx", "xlsx", "png", "jpg", "jpeg", "zip"];
const ALL = "all";
const NONE = "none";

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-zA-Z0-9._-]+/g, "_");

const formatSize = (n: number | null) => {
  if (!n) return "";
  return n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export function DocumentsManager() {
  const [supabase] = useState(() => createBrowserSupabase());
  const [folders, setFolders] = useState<Folder[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [current, setCurrent] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<Doc | null>(null);

  const load = useCallback(async () => {
    const [f, d] = await Promise.all([
      supabase.from("folders").select("id,name").order("sort_order").order("name"),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
    ]);
    if (f.error || d.error) setError((f.error ?? d.error)!.message);
    setFolders(f.data ?? []);
    setDocs((d.data ?? []) as Doc[]);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const log = (action: string, name: string) =>
    supabase.from("activity_log").insert({ action, entity: `Document: ${name}` });

  const validate = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(ext)) return `"${file.name}": unsupported type. Allowed: ${ALLOWED.join(", ").toUpperCase()}.`;
    return null;
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      const bad = validate(file);
      if (bad) {
        setError(bad);
        continue;
      }
      const path = `${crypto.randomUUID()}-${safeName(file.name)}`;
      const up = await supabase.storage.from("documents").upload(path, file, { contentType: file.type || undefined });
      if (up.error) {
        setError(up.error.message);
        continue;
      }
      const { error: err } = await supabase.from("documents").insert({
        name: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        folder_id: current === ALL || current === NONE ? null : current,
      });
      if (err) {
        await supabase.storage.from("documents").remove([path]);
        setError(err.message);
        continue;
      }
      await log("Uploaded", file.name);
    }
    if (uploadRef.current) uploadRef.current.value = "";
    setBusy(false);
    await load();
  }

  async function replace(file: File | undefined) {
    const doc = replaceTarget.current;
    if (!file || !doc) return;
    const bad = validate(file);
    if (bad) return setError(bad);
    setBusy(true);
    setError(null);
    const path = `${crypto.randomUUID()}-${safeName(file.name)}`;
    const up = await supabase.storage.from("documents").upload(path, file, { contentType: file.type || undefined });
    if (up.error) {
      setError(up.error.message);
      setBusy(false);
      return;
    }
    const { error: err } = await supabase
      .from("documents")
      .update({ storage_path: path, mime_type: file.type || null, size_bytes: file.size, updated_at: new Date().toISOString() })
      .eq("id", doc.id);
    if (err) {
      await supabase.storage.from("documents").remove([path]);
      setError(err.message);
    } else {
      await supabase.storage.from("documents").remove([doc.storage_path]);
      await log("Replaced", doc.name);
    }
    if (replaceRef.current) replaceRef.current.value = "";
    setBusy(false);
    await load();
  }

  async function createFolder() {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;
    const { error: err } = await supabase.from("folders").insert({ name: name.trim(), sort_order: folders.length + 1 });
    if (err) return setError(err.message);
    await log("Created folder", name.trim());
    await load();
  }

  async function saveRename() {
    if (!renaming?.name.trim()) return;
    const { error: err } = await supabase.from("documents").update({ name: renaming.name.trim() }).eq("id", renaming.id);
    if (err) return setError(err.message);
    await log("Renamed", renaming.name.trim());
    setRenaming(null);
    await load();
  }

  async function patch(doc: Doc, values: Partial<Doc>, action: string) {
    const { error: err } = await supabase
      .from("documents")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", doc.id);
    if (err) return setError(err.message);
    await log(action, doc.name);
    await load();
  }

  async function remove(doc: Doc) {
    if (!window.confirm(`Delete "${doc.name}"? It will also disappear from every section that uses it.`)) return;
    await supabase.storage.from("documents").remove([doc.storage_path]);
    const { error: err } = await supabase.from("documents").delete().eq("id", doc.id);
    if (err) return setError(err.message);
    await log("Deleted", doc.name);
    await load();
  }

  const q = query.trim().toLowerCase();
  const visible = docs.filter(
    (d) =>
      (current === ALL || (current === NONE ? d.folder_id === null : d.folder_id === current)) &&
      (!q || d.name.toLowerCase().includes(q)),
  );

  const tab = (id: string, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setCurrent(id)}
      aria-pressed={current === id}
      className={`min-h-11 rounded-md border px-3 text-sm ${
        current === id ? "border-rose-strong bg-blush text-rose-strong" : "border-rose-soft bg-white hover:bg-blush"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={uploadRef}
          type="file"
          multiple
          hidden
          accept={ALLOWED.map((e) => `.${e}`).join(",")}
          onChange={(e) => upload(e.target.files)}
        />
        <input
          ref={replaceRef}
          type="file"
          hidden
          accept={ALLOWED.map((e) => `.${e}`).join(",")}
          onChange={(e) => replace(e.target.files?.[0])}
        />
        <button type="button" disabled={busy} onClick={() => uploadRef.current?.click()} className={btnPrimary}>
          {busy ? "Working…" : "Upload File"}
        </button>
        <button type="button" onClick={createFolder} className={btnOutline}>
          Create Folder
        </button>
        <div className="min-w-48 flex-1">
          <label htmlFor="doc-search" className="sr-only">
            Search documents
          </label>
          <input
            id="doc-search"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Folders">
        {tab(ALL, "All")}
        {folders.map((f) => tab(f.id, f.name))}
        {tab(NONE, "Unfiled")}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-rose-strong">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <Empty>No documents.</Empty>
      ) : (
        <ul className="space-y-3">
          {visible.map((d) => (
            <li key={d.id} className="rounded-lg border border-rose-soft bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {renaming?.id === d.id ? (
                    <div className="flex gap-2">
                      <label htmlFor={`rn-${d.id}`} className="sr-only">
                        Document name
                      </label>
                      <input
                        id={`rn-${d.id}`}
                        value={renaming.name}
                        onChange={(e) => setRenaming({ id: d.id, name: e.target.value })}
                        className={inputCls}
                      />
                      <button type="button" onClick={saveRename} className={btnPrimary}>
                        Save
                      </button>
                      <button type="button" onClick={() => setRenaming(null)} className={btnOutline}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="break-words font-medium">{d.name}</p>
                  )}
                  <p className="text-sm text-muted">
                    {[formatSize(d.size_bytes), new Date(d.created_at).toLocaleDateString("en-GB")].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`fo-${d.id}`}>
                    Folder
                  </label>
                  <select
                    id={`fo-${d.id}`}
                    value={d.folder_id ?? ""}
                    onChange={(e) => patch(d, { folder_id: e.target.value || null }, "Moved")}
                    className={`${inputCls} w-auto`}
                  >
                    <option value="">Unfiled</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor={`vi-${d.id}`}>
                    Visibility
                  </label>
                  <select
                    id={`vi-${d.id}`}
                    value={d.visibility}
                    onChange={(e) => patch(d, { visibility: e.target.value as Doc["visibility"] }, `Set ${e.target.value}`)}
                    className={`${inputCls} w-auto`}
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className={btnOutline} href={`/files/${d.id}`} target="_blank" rel="noopener noreferrer">
                  Preview
                </a>
                <a className={btnOutline} href={`/files/${d.id}?download=1`}>
                  Download
                </a>
                <button type="button" onClick={() => setRenaming({ id: d.id, name: d.name })} className={btnOutline}>
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    replaceTarget.current = d;
                    replaceRef.current?.click();
                  }}
                  className={btnOutline}
                >
                  Replace File
                </button>
                <button type="button" onClick={() => remove(d)} className={btnDanger}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
