import { Card, DocLinks, Empty, PageTitle } from "@/components/ui";
import { getExperiences, getLinkedDocs } from "@/lib/queries";

export const metadata = { title: "Experience · Hoang Bao Han" };

export default async function ExperiencePage() {
  const items = await getExperiences();
  const docs = await getLinkedDocs("experience", items.map((i) => i.id));

  return (
    <div>
      <PageTitle>Experience</PageTitle>
      {items.length === 0 ? (
        <Empty>No content yet.</Empty>
      ) : (
        <ol className="space-y-5 border-l-2 border-rose-soft pl-5">
          {items.map((x) => (
            <li key={x.id} className="relative">
              <span className="absolute -left-[1.62rem] top-6 h-3 w-3 rounded-full bg-rose" aria-hidden />
              <Card>
                <h2 className="text-lg font-semibold">{x.organization}</h2>
                <p className="text-sm text-muted">{x.period}</p>
                {x.role ? <p className="mt-1 text-sm font-medium text-rose-strong">{x.role}</p> : null}
                {x.description ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                    {x.description
                      .split("\n")
                      .filter(Boolean)
                      .map((line: string, i: number) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                ) : null}
                <DocLinks docs={docs[x.id]} />
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
