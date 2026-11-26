import Link from "next/link";
import { Card, Empty, PageTitle } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const count = async (table: string, status?: string) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count: c } = await q;
    return c ?? 0;
  };
  const [projects, certificates, experiences, documents, unread, { data: activity }] = await Promise.all([
    count("projects"),
    count("certificates"),
    count("experiences"),
    count("documents"),
    count("messages", "unread"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Certificates", value: certificates, href: "/admin/certificates" },
    { label: "Experience", value: experiences, href: "/admin/experience" },
    { label: "Documents", value: documents, href: "/admin/documents" },
    { label: "Unread messages", value: unread, href: "/admin/inbox" },
  ];

  return (
    <div className="space-y-8">
      <PageTitle>Dashboard</PageTitle>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded-lg border border-rose-soft p-5 transition-colors hover:bg-blush">
              <p className="text-3xl font-semibold text-rose-strong">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="recent">
        <h2 id="recent" className="mb-3 text-lg font-semibold">
          Recent Activities
        </h2>
        {activity?.length ? (
          <Card>
            <ul className="divide-y divide-rose-soft text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>
                    {a.action} · {a.entity}
                  </span>
                  <time className="text-muted" dateTime={a.created_at}>
                    {new Date(a.created_at).toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </time>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Empty>No activity yet.</Empty>
        )}
      </section>
    </div>
  );
}
