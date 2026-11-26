import type { ReactNode } from "react";

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-6 text-2xl font-semibold text-ink">{children}</h1>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-rose-soft bg-white p-5 ${className}`}>{children}</div>;
}

const btn =
  "inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors";
export const btnPrimary = `${btn} bg-rose-strong text-white hover:bg-[#8f444d] disabled:opacity-60`;
export const btnOutline = `${btn} border border-rose-soft bg-white text-ink hover:bg-blush disabled:opacity-60`;
export const btnDanger = `${btn} border border-rose-soft bg-white text-rose-strong hover:bg-blush disabled:opacity-60`;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  newTab,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  newTab?: boolean;
}) {
  return (
    <a
      className={variant === "primary" ? btnPrimary : btnOutline}
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export const inputCls =
  "min-h-11 w-full rounded-md border border-rose-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-muted";

export function DocLinks({ docs }: { docs?: { id: string; name: string }[] }) {
  if (!docs?.length) return null;
  return (
    <ul className="mt-3 space-y-2">
      {docs.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-ink">{d.name}</span>
          <a className="text-rose-strong underline" href={`/files/${d.id}`} target="_blank" rel="noopener noreferrer">
            View
          </a>
          <a className="text-rose-strong underline" href={`/files/${d.id}?download=1`}>
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
