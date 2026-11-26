import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { SignOutButton } from "@/components/admin/sign-out";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Hoang Bao Han", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const [{ data: profile }, { count: unread }] = await Promise.all([
    supabase.from("profile").select("full_name,title,avatar_document_id").eq("id", 1).maybeSingle(),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
  ]);

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/profile", label: "Profile" },
    { href: "/admin/education", label: "Education" },
    { href: "/admin/experience", label: "Experience" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/certificates", label: "Certificates" },
    { href: "/admin/documents", label: "Documents" },
    { href: "/admin/inbox", label: "Inbox", badge: unread ?? 0 },
  ];

  return (
    <Shell
      nav={nav}
      name={profile?.full_name ?? ""}
      subtitle={profile?.title ?? ""}
      avatar={profile?.avatar_document_id ? `/files/${profile.avatar_document_id}` : "/avatar.jpg"}
      footer={<SignOutButton />}
    >
      {children}
    </Shell>
  );
}
