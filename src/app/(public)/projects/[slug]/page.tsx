import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, DocLinks } from "@/components/ui";
import { getLinkedDocs, getProject } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getProject(slug);
  return { title: p ? `${p.name} · Hoang Bao Han` : "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [attachments, gallery] = await Promise.all([
    getLinkedDocs("project_attachment", [project.id]),
    getLinkedDocs("project_gallery", [project.id]),
  ]);
  const links = (project.links ?? []) as { label: string; url: string }[];

  const sections: [string, string][] = [
    ["Description", project.description],
    ["Objectives", project.objectives],
    ["My Contributions", project.contributions],
    ["Outcomes", project.outcomes],
    ["Skills & Tools", project.skills_tools],
  ];

  return (
    <article className="space-y-6">
      <Link href="/projects" className="text-sm text-rose-strong underline">
        Projects
      </Link>
      <h1 className="text-2xl font-semibold">{project.name}</h1>

      {project.cover_document_id ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/files/${project.cover_document_id}`}
          alt={project.name}
          className="max-h-96 w-full rounded-lg border border-rose-soft object-cover"
        />
      ) : null}

      <Card>
        <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted">Category</dt>
          <dd>{project.category}</dd>
          {project.role ? (
            <>
              <dt className="text-muted">Role</dt>
              <dd>{project.role}</dd>
            </>
          ) : null}
          {project.duration ? (
            <>
              <dt className="text-muted">Duration</dt>
              <dd>{project.duration}</dd>
            </>
          ) : null}
        </dl>
      </Card>

      {sections.map(([title, text]) =>
        text ? (
          <section key={title}>
            <h2 className="mb-2 text-lg font-semibold">{title}</h2>
            <p className="whitespace-pre-line text-sm">{text}</p>
          </section>
        ) : null,
      )}

      {gallery[project.id]?.length ? (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Gallery</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {gallery[project.id].map((g) => (
              <li key={g.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/files/${g.id}`} alt={g.name} className="w-full rounded-lg border border-rose-soft" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {attachments[project.id]?.length ? (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Attachments</h2>
          <DocLinks docs={attachments[project.id]} />
        </section>
      ) : null}

      {links.length ? (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Links</h2>
          <ul className="space-y-1 text-sm">
            {links.map((l, i) => (
              <li key={i}>
                <a className="text-rose-strong underline" href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label || l.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
