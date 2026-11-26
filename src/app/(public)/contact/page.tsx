import { Card, PageTitle } from "@/components/ui";
import { getProfile } from "@/lib/queries";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact · Hoang Bao Han" };

export default async function ContactPage() {
  const p = await getProfile();
  const rows: [string, string | null, string?][] = [
    ["Email", p?.email || null, p?.email ? `mailto:${p.email}` : undefined],
    ["Phone", p?.phone || null, p?.phone ? `tel:${p.phone}` : undefined],
    ["Location", p?.location || null],
    ["LinkedIn", p?.linkedin_url || null, p?.linkedin_url || undefined],
    ["GitHub", p?.github_url || null, p?.github_url || undefined],
  ];

  return (
    <div className="space-y-8">
      <PageTitle>Contact</PageTitle>
      <Card>
        <dl className="grid gap-3 text-sm sm:grid-cols-[7rem_1fr]">
          {rows
            .filter(([, v]) => v)
            .map(([label, value, href]) => (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd className="break-words">
                  {href ? (
                    <a
                      className="text-rose-strong underline"
                      href={href}
                      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
        </dl>
      </Card>
      <section aria-labelledby="contact-form">
        <h2 id="contact-form" className="mb-3 text-lg font-semibold">
          Send a message
        </h2>
        <div className="max-w-xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
