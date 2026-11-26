import { PageTitle } from "@/components/ui";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function ProjectsAdminPage() {
  return (
    <div>
      <PageTitle>Projects</PageTitle>
      <ResourceManager
        table="projects"
        singular="Project"
        titleKey="name"
        subtitleKeys={["category", "role"]}
        slugFrom="name"
        defaults={{ visible: true, category: "Academic", links: [] }}
        docLinks={[
          { type: "project_attachment", label: "Attachments" },
          { type: "project_gallery", label: "Gallery" },
        ]}
        fields={[
          { name: "name", label: "Project Name", required: true },
          { name: "category", label: "Category", type: "select", options: ["Research", "Innovation", "Business", "Academic"] },
          { name: "role", label: "Role" },
          { name: "duration", label: "Duration" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "objectives", label: "Objectives", type: "textarea" },
          { name: "contributions", label: "My Contributions", type: "textarea" },
          { name: "outcomes", label: "Outcomes", type: "textarea" },
          { name: "skills_tools", label: "Skills & Tools", type: "textarea" },
          { name: "cover_document_id", label: "Cover Image", type: "document", imageOnly: true },
          { name: "links", label: "Links (GitHub, demo, video)", type: "links" },
          { name: "visible", label: "Visible on website", type: "checkbox" },
        ]}
      />
    </div>
  );
}
