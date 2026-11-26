import { PageTitle } from "@/components/ui";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function CertificatesAdminPage() {
  return (
    <div>
      <PageTitle>Certificates</PageTitle>
      <ResourceManager
        table="certificates"
        singular="Certificate"
        titleKey="name"
        subtitleKeys={["issuer", "issued_date"]}
        defaults={{ visible: true, featured: false }}
        fields={[
          { name: "name", label: "Certificate Name", required: true },
          { name: "issuer", label: "Issuer" },
          { name: "issued_date", label: "Issue Date" },
          { name: "credential_code", label: "Credential Code" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "document_id", label: "Evidence File", type: "document" },
          { name: "featured", label: "Show on Home page", type: "checkbox" },
          { name: "visible", label: "Visible on website", type: "checkbox" },
        ]}
      />
    </div>
  );
}
