"use client";

import { useActionState } from "react";
import { btnPrimary, inputCls } from "@/components/ui";
import { sendMessage, type ContactState } from "./actions";

const labelCls = "mb-1 block text-sm font-medium";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, null);

  if (state?.ok) {
    return (
      <p role="status" className="rounded-lg border border-rose-soft bg-blush p-4 text-sm">
        Message sent successfully.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelCls}>
          Full Name
        </label>
        <input id="name" name="name" required maxLength={200} autoComplete="name" className={inputCls} />
      </div>
      <div>
        <label htmlFor="email" className={labelCls}>
          Email Address
        </label>
        <input id="email" name="email" type="email" required maxLength={320} autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label htmlFor="subject" className={labelCls}>
          Subject
        </label>
        <input id="subject" name="subject" required maxLength={300} className={inputCls} />
      </div>
      <div>
        <label htmlFor="message" className={labelCls}>
          Message
        </label>
        <textarea id="message" name="message" required maxLength={5000} rows={6} className={inputCls} />
      </div>
      {state?.error ? (
        <p role="alert" className="text-sm text-rose-strong">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
