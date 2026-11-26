import { PageTitle } from "@/components/ui";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function ExperienceAdminPage() {
  return (
    <div>
      <PageTitle>Experience</PageTitle>
      <ResourceManager
        table="experiences"
        singular="Experience"
        titleKey="organization"
        subtitleKeys={["role", "period"]}
        defaults={{ visible: true }}
        docLinks={[{ type: "experience", label: "Supporting documents" }]}
        fields={[
          { name: "organization", label: "Organization / Program", required: true },
          { name: "role", label: "Role" },
          { name: "period", label: "Period" },
          { name: "description", label: "Description", type: "textarea", help: "One bullet point per line." },
          { name: "visible", label: "Visible on website", type: "checkbox" },
        ]}
      />
    </div>
  );
}
