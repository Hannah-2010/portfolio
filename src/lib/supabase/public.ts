import { createClient } from "@supabase/supabase-js";

// Client ẩn danh, không gắn phiên đăng nhập: dùng cho các trang công khai.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
