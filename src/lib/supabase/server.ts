import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client gắn phiên đăng nhập: dùng cho khu quản trị và route /files.
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component không ghi được cookie; proxy đã làm mới phiên.
          }
        },
      },
    },
  );
}
