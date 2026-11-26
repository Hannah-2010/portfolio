import { PageTitle } from "@/components/ui";
import { DocumentsManager } from "@/components/admin/documents-manager";

export default function DocumentsAdminPage() {
  return (
    <div>
      <PageTitle>Documents</PageTitle>
      <DocumentsManager />
    </div>
  );
}
