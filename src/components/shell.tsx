"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export type NavItem = { href: string; label: string; badge?: number };

export function Shell({
  nav,
  name,
  subtitle,
  avatar,
  footer,
  children,
}: {
  nav: NavItem[];
  name: string;
  subtitle: string;
  avatar: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" || href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center px-5 pt-8 pb-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={name}
          width={112}
          height={112}
          className="h-28 w-28 rounded-full border-2 border-white object-cover object-top"
        />
        <p className="mt-4 text-base font-semibold text-ink">{name}</p>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors ${
                  isActive(item.href) ? "bg-white text-rose-strong" : "text-ink hover:bg-white/60"
                }`}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span
                    className="rounded-full bg-rose-strong px-2 text-xs text-white"
                    aria-label={`${item.badge} unread`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {footer ? <div className="p-3">{footer}</div> : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-white md:pl-64">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-rose-soft bg-blush px-4 md:hidden">
        <span className="text-sm font-semibold">{name}</span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="min-h-11 min-w-11 rounded-md px-3 text-sm font-medium hover:bg-white/60"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>
      <aside
        id="mobile-nav"
        className={`${open ? "block" : "hidden"} fixed inset-x-0 top-14 bottom-0 z-20 overflow-y-auto bg-blush md:hidden`}
      >
        {sidebar}
      </aside>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-rose-soft bg-blush md:block">
        {sidebar}
      </aside>
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-10 md:py-12">{children}</main>
    </div>
  );
}
