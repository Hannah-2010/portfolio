import { PageTitle } from "@/components/ui";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function EducationAdminPage() {
  return (
    <div>
      <PageTitle>Education</PageTitle>
      <ResourceManager
        table="education"
        singular="Education"
        titleKey="institution"
        subtitleKeys={["major", "duration", "gpa"]}
        defaults={{ visible: true }}
        docLinks={[{ type: "education", label: "Transcript and supporting documents" }]}
        fields={[
          { name: "institution", label: "Institution", required: true },
          { name: "major", label: "Major" },
          { name: "level", label: "Level" },
          { name: "duration", label: "Duration" },
          { name: "gpa", label: "GPA" },
          { name: "honors", label: "Honors", type: "textarea" },
          { name: "coursework", label: "Relevant Coursework", type: "textarea" },
          { name: "visible", label: "Visible on website", type: "checkbox" },
        ]}
      />
    </div>
  );
}
