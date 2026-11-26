import Link from "next/link";
import { Empty, PageTitle } from "@/components/ui";
import { getProjects } from "@/lib/queries";

export const metadata = { title: "Projects · Hoang Bao Han" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div>
      <PageTitle>Projects</PageTitle>
      {projects.length === 0 ? (
        <Empty>No content yet.</Empty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.slug}`}
                className="flex min-h-20 items-center rounded-lg border border-rose-soft bg-white p-5 font-medium transition-colors hover:bg-blush"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
