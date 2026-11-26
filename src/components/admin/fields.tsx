"use client";

import { inputCls } from "@/components/ui";

export type DocOption = { id: string; name: string; mime_type: string | null; visibility: string };

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "checkbox" | "number" | "document" | "links";
  options?: string[];
  required?: boolean;
  imageOnly?: boolean;
  help?: string;
};

export type LinkItem = { label: string; url: string };

const labelCls = "mb-1 block text-sm font-medium";

export function FieldInput({
  field,
  value,
  onChange,
  docs,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  docs: DocOption[];
}) {
  const id = `f-${field.name}`;
  const type = field.type ?? "text";

  if (type === "checkbox") {
    return (
      <div className="flex min-h-11 items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 accent-[#a8545d]"
        />
        <label htmlFor={id} className="text-sm font-medium">
          {field.label}
        </label>
      </div>
    );
  }

  let control: React.ReactNode;
  if (type === "textarea") {
    control = (
      <textarea
        id={id}
        rows={5}
        required={field.required}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    );
  } else if (type === "select") {
    control = (
      <select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {field.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (type === "document") {
    const list = field.imageOnly ? docs.filter((d) => d.mime_type?.startsWith("image/")) : docs;
    control = (
      <select
        id={id}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value || null)}
        className={inputCls}
      >
        <option value="">None</option>
        {list.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} ({d.visibility})
          </option>
        ))}
      </select>
    );
  } else if (type === "links") {
    const items = (Array.isArray(value) ? value : []) as LinkItem[];
    const set = (i: number, patch: Partial<LinkItem>) =>
      onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    control = (
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input
              aria-label={`Link ${i + 1} label`}
              placeholder="Label"
              value={it.label}
              onChange={(e) => set(i, { label: e.target.value })}
              className={inputCls}
            />
            <input
              aria-label={`Link ${i + 1} URL`}
              placeholder="https://"
              type="url"
              value={it.url}
              onChange={(e) => set(i, { url: e.target.value })}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="min-h-11 rounded-md border border-rose-soft px-3 text-sm text-rose-strong hover:bg-blush"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { label: "", url: "" }])}
          className="min-h-11 rounded-md border border-rose-soft px-3 text-sm hover:bg-blush"
        >
          Add link
        </button>
      </div>
    );
  } else {
    control = (
      <input
        id={id}
        type={type === "number" ? "number" : "text"}
        required={field.required}
        value={String(value ?? "")}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className={inputCls}
      />
    );
  }

  return (
    <div>
      {type === "links" ? (
        <span className={labelCls}>{field.label}</span>
      ) : (
        <label htmlFor={id} className={labelCls}>
          {field.label}
        </label>
      )}
      {control}
      {field.help ? <p className="mt-1 text-xs text-muted">{field.help}</p> : null}
    </div>
  );
}
