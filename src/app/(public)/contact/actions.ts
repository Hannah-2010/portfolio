"use server";

import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = { ok: boolean; error?: string } | null;

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const sender_name = String(formData.get("name") ?? "").trim();
  const sender_email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("message") ?? "").trim();

  if (!sender_name || !sender_email || !subject || !body) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender_email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (body.length > 5000 || subject.length > 300 || sender_name.length > 200) {
    return { ok: false, error: "One of the fields is too long." };
  }

  const { error } = await createPublicClient()
    .from("messages")
    .insert({ sender_name, sender_email, subject, body });
  if (error) return { ok: false, error: "The message could not be sent. Please try again." };
  return { ok: true };
}
