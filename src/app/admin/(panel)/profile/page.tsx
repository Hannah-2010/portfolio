import { PageTitle } from "@/components/ui";
import { ProfileForm } from "@/components/admin/profile-form";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function ProfileAdminPage() {
  return (
    <div className="space-y-10">
      <section>
        <PageTitle>Profile</PageTitle>
        <ProfileForm />
      </section>
      <section aria-labelledby="skills-h">
        <h2 id="skills-h" className="mb-4 text-lg font-semibold">
          Skills
        </h2>
        <ResourceManager
          table="skills"
          singular="Skill"
          titleKey="name"
          subtitleKeys={["category"]}
          fields={[
            { name: "category", label: "Category", required: true },
            { name: "name", label: "Skill", required: true },
          ]}
        />
      </section>
    </div>
  );
}
