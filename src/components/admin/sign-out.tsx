"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { btnOutline } from "@/components/ui";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className={`${btnOutline} w-full`}
      onClick={async () => {
        await createBrowserSupabase().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
