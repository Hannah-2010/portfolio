"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { btnDanger, btnOutline, ButtonLink, Empty, inputCls } from "@/components/ui";

type Msg = {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  status: "unread" | "read" | "archived";
  created_at: string;
};

const FILTERS = ["all", "unread", "read", "archived"] as const;
const fmt = (s: string) => new Date(s).toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh" });

export function InboxManager() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabase());
  const [messages, setMessages] = useState<Msg[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (err) setError(err.message);
    setMessages((data ?? []) as Msg[]);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function setStatus(m: Msg, status: Msg["status"]) {
    const { error: err } = await supabase.from("messages").update({ status }).eq("id", m.id);
    if (err) return setError(err.message);
    await load();
    router.refresh(); // cập nhật số tin chưa đọc ở thanh bên
  }

  async function open(m: Msg) {
    setSelectedId(m.id);
    if (m.status === "unread") await setStatus(m, "read");
  }

  async function remove(m: Msg) {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    const { error: err } = await supabase.from("messages").delete().eq("id", m.id);
    if (err) return setError(err.message);
    setSelectedId(null);
    await load();
    router.refresh();
  }

  const q = query.trim().toLowerCase();
  const list = messages.filter(
    (m) =>
      (filter === "all" ? m.status !== "archived" : m.status === filter) &&
      (!q || [m.sender_name, m.sender_email, m.subject, m.body].some((v) => v.toLowerCase().includes(q))),
  );
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const replyHref = (m: Msg) =>
    `mailto:${m.sender_email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}&body=${encodeURIComponent(
      `Hello ${m.sender_name},\n\n\n\n--- ${fmt(m.created_at)}, ${m.sender_name} wrote:\n${m.body
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n")}`,
    )}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="min-w-48 flex-1">
          <label htmlFor="inbox-search" className="sr-only">
            Search messages
          </label>
          <input
            id="inbox-search"
            type="search"
            placeholder="Search name, email, message"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputCls}
          />
        </div>
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-md border px-3 text-sm capitalize ${
                filter === f ? "border-rose-strong bg-blush text-rose-strong" : "border-rose-soft bg-white hover:bg-blush"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-rose-strong">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div>
          {list.length === 0 ? (
            <Empty>No messages.</Empty>
          ) : (
            <ul className="divide-y divide-rose-soft overflow-hidden rounded-lg border border-rose-soft">
              {list.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    aria-current={m.id === selectedId}
                    className={`block min-h-11 w-full px-4 py-3 text-left hover:bg-blush ${m.id === selectedId ? "bg-blush" : ""}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${m.status === "unread" ? "font-semibold" : ""}`}>{m.sender_name}</span>
                      {m.status === "unread" ? <span className="rounded-full bg-rose-strong px-2 text-xs text-white">Unread</span> : null}
                    </span>
                    <span className="block truncate text-sm">{m.subject}</span>
                    <span className="block text-xs text-muted">{fmt(m.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {selected ? (
            <article className="space-y-4 rounded-lg border border-rose-soft p-5">
              <header>
                <h2 className="text-lg font-semibold">{selected.subject}</h2>
                <p className="text-sm text-muted">
                  {selected.sender_name} · <a className="underline" href={`mailto:${selected.sender_email}`}>{selected.sender_email}</a>
                </p>
                <p className="text-xs text-muted">
                  {fmt(selected.created_at)} · {selected.status}
                </p>
              </header>
              <p className="whitespace-pre-wrap text-sm">{selected.body}</p>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={replyHref(selected)}>Reply</ButtonLink>
                {selected.status === "read" ? (
                  <button type="button" className={btnOutline} onClick={() => setStatus(selected, "unread")}>
                    Mark as unread
                  </button>
                ) : null}
                {selected.status === "archived" ? (
                  <button type="button" className={btnOutline} onClick={() => setStatus(selected, "read")}>
                    Unarchive
                  </button>
                ) : (
                  <button type="button" className={btnOutline} onClick={() => setStatus(selected, "archived")}>
                    Archive
                  </button>
                )}
                <button type="button" className={btnDanger} onClick={() => remove(selected)}>
                  Delete
                </button>
              </div>
            </article>
          ) : (
            <Empty>Select a message to read it.</Empty>
          )}
        </div>
      </div>
    </div>
  );
}
