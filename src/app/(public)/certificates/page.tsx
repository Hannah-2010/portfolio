import { Card, Empty, PageTitle } from "@/components/ui";
import { getCertificates } from "@/lib/queries";

export const metadata = { title: "Certificates · Hoang Bao Han" };

export default async function CertificatesPage() {
  const items = await getCertificates();
  return (
    <div>
      <PageTitle>Certificates</PageTitle>
      {items.length === 0 ? (
        <Empty>No content yet.</Empty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((c) => (
            <li key={c.id}>
              <Card className="h-full">
                <h2 className="font-semibold">{c.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {[c.issuer, c.issued_date, c.credential_code].filter(Boolean).join(" · ")}
                </p>
                {c.description ? <p className="mt-2 text-sm">{c.description}</p> : null}
                {c.document_id ? (
                  <p className="mt-3 flex gap-4 text-sm">
                    <a className="text-rose-strong underline" href={`/files/${c.document_id}`} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                    <a className="text-rose-strong underline" href={`/files/${c.document_id}?download=1`}>
                      Download
                    </a>
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
