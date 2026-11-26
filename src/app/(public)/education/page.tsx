import { Card, DocLinks, Empty, PageTitle } from "@/components/ui";
import { getEducation, getLinkedDocs } from "@/lib/queries";

export const metadata = { title: "Education · Hoang Bao Han" };

export default async function EducationPage() {
  const items = await getEducation();
  const docs = await getLinkedDocs("education", items.map((i) => i.id));

  return (
    <div>
      <PageTitle>Education</PageTitle>
      {items.length === 0 ? (
        <Empty>No content yet.</Empty>
      ) : (
        <ol className="space-y-5 border-l-2 border-rose-soft pl-5">
          {items.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[1.62rem] top-6 h-3 w-3 rounded-full bg-rose" aria-hidden />
              <Card>
                <h2 className="text-lg font-semibold">{e.institution}</h2>
                <p className="text-sm text-muted">
                  {[e.major, e.level, e.duration].filter(Boolean).join(" · ")}
                </p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[9rem_1fr]">
                  {e.gpa ? (
                    <>
                      <dt className="text-muted">GPA</dt>
                      <dd>{e.gpa}</dd>
                    </>
                  ) : null}
                  {e.honors ? (
                    <>
                      <dt className="text-muted">Honors</dt>
                      <dd>{e.honors}</dd>
                    </>
                  ) : null}
                  {e.coursework ? (
                    <>
                      <dt className="text-muted">Relevant Coursework</dt>
                      <dd>{e.coursework}</dd>
                    </>
                  ) : null}
                </dl>
                <DocLinks docs={docs[e.id]} />
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
