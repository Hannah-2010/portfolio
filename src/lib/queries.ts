import { createPublicClient } from "@/lib/supabase/public";

export type DocRef = { id: string; name: string; mime_type: string | null };

export async function getProfile() {
  const { data } = await createPublicClient().from("profile").select("*").eq("id", 1).maybeSingle();
  return data;
}

export const avatarSrc = (p: { avatar_document_id: string | null } | null) =>
  p?.avatar_document_id ? `/files/${p.avatar_document_id}` : "/avatar.jpg";

export const cvHref = (p: { cv_document_id: string | null } | null) =>
  p?.cv_document_id ? `/files/${p.cv_document_id}?download=1` : "/cv.pdf";

export async function getSkills() {
  const { data } = await createPublicClient().from("skills").select("*").order("sort_order");
  return data ?? [];
}

export async function getEducation() {
  const { data } = await createPublicClient().from("education").select("*").order("sort_order");
  return data ?? [];
}

export async function getExperiences() {
  const { data } = await createPublicClient().from("experiences").select("*").order("sort_order");
  return data ?? [];
}

export async function getCertificates() {
  const { data } = await createPublicClient().from("certificates").select("*").order("sort_order");
  return data ?? [];
}

export async function getProjects() {
  const { data } = await createPublicClient().from("projects").select("id,slug,name").order("sort_order");
  return data ?? [];
}

export async function getProject(slug: string) {
  const { data } = await createPublicClient().from("projects").select("*").eq("slug", slug).maybeSingle();
  return data;
}

// Tài liệu công khai gắn với một mục (RLS chỉ trả về tài liệu public).
export async function getLinkedDocs(entityType: string, entityIds: string[]) {
  const map: Record<string, { id: string; name: string; mime_type: string | null }[]> = {};
  if (!entityIds.length) return map;
  const sb = createPublicClient();
  const { data: links } = await sb
    .from("document_links")
    .select("document_id,entity_id,sort_order")
    .eq("entity_type", entityType)
    .in("entity_id", entityIds)
    .order("sort_order");
  if (!links?.length) return map;
  const { data: docs } = await sb
    .from("documents")
    .select("id,name,mime_type")
    .in("id", links.map((l) => l.document_id));
  const byId = new Map((docs ?? []).map((d) => [d.id, d]));
  for (const l of links) {
    const d = byId.get(l.document_id);
    if (d) (map[l.entity_id] ??= []).push(d);
  }
  return map;
}
