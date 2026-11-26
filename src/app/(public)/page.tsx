import { ButtonLink, Card } from "@/components/ui";
import { cvHref, getCertificates, getEducation, getProfile } from "@/lib/queries";

export default async function HomePage() {
  const [profile, education, certificates] = await Promise.all([getProfile(), getEducation(), getCertificates()]);
  const edu = education[0];
  const highlights = certificates.filter((c) => c.featured);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold text-ink">{profile?.full_name}</h1>
        <p className="mt-1 text-lg text-rose-strong">{profile?.title}</p>
        {profile?.about ? <p className="mt-5 max-w-2xl whitespace-pre-line text-ink">{profile.about}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={cvHref(profile)}>Download CV</ButtonLink>
          <ButtonLink href="/projects" variant="outline">
            View My Projects
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Contact Me
          </ButtonLink>
        </div>
      </section>

      {edu ? (
        <section aria-labelledby="home-edu">
          <h2 id="home-edu" className="mb-3 text-lg font-semibold">
            Education
          </h2>
          <Card>
            <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="text-muted">University</dt>
              <dd>{edu.institution}</dd>
              <dt className="text-muted">Major</dt>
              <dd>{edu.major}</dd>
              {edu.gpa ? (
                <>
                  <dt className="text-muted">GPA</dt>
                  <dd>{edu.gpa}</dd>
                </>
              ) : null}
            </dl>
          </Card>
        </section>
      ) : null}

      {highlights.length ? (
        <section aria-labelledby="home-highlights">
          <h2 id="home-highlights" className="mb-3 text-lg font-semibold">
            Achievements
          </h2>
          <ul className="space-y-2">
            {highlights.map((c) => (
              <li key={c.id} className="rounded-lg border border-rose-soft px-4 py-3 text-sm">
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
