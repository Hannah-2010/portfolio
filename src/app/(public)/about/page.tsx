import { Card, Empty, PageTitle } from "@/components/ui";
import { getProfile, getSkills } from "@/lib/queries";

export const metadata = { title: "About · Hoang Bao Han" };

export default async function AboutPage() {
  const [profile, skills] = await Promise.all([getProfile(), getSkills()]);
  const groups = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <PageTitle>About</PageTitle>
      <section aria-labelledby="about-summary">
        <h2 id="about-summary" className="mb-3 text-lg font-semibold">
          Professional Summary
        </h2>
        {profile?.about ? <p className="max-w-2xl whitespace-pre-line">{profile.about}</p> : <Empty>No content yet.</Empty>}
      </section>
      <section aria-labelledby="about-skills">
        <h2 id="about-skills" className="mb-3 text-lg font-semibold">
          Skills
        </h2>
        {Object.keys(groups).length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(groups).map(([category, names]) => (
              <Card key={category}>
                <h3 className="mb-2 text-sm font-semibold text-rose-strong">{category}</h3>
                <ul className="space-y-1 text-sm">
                  {names.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>No content yet.</Empty>
        )}
      </section>
    </div>
  );
}
