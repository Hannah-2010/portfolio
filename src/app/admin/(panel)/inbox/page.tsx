import { PageTitle } from "@/components/ui";
import { InboxManager } from "@/components/admin/inbox-manager";

export default function InboxAdminPage() {
  return (
    <div>
      <PageTitle>Inbox</PageTitle>
      <InboxManager />
    </div>
  );
}
