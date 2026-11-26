import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// Chuyển hướng đến liên kết tạm thời của tệp. RLS quyết định ai được xem:
// khách chỉ thấy tài liệu public, quản trị viên thấy tất cả.
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createServerSupabase();
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path,name")
    .eq("id", id)
    .maybeSingle();
  if (!doc) return new NextResponse("Not found", { status: 404 });
  const download = request.nextUrl.searchParams.get("download") === "1";
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 60, download ? { download: doc.name } : undefined);
  if (!data?.signedUrl) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
