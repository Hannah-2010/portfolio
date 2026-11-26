import { Shell } from "@/components/shell";
import { avatarSrc, getProfile } from "@/lib/queries";

export const revalidate = 60;

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/education", label: "Education" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/contact", label: "Contact" },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <Shell nav={nav} name={profile?.full_name ?? ""} subtitle={profile?.title ?? ""} avatar={avatarSrc(profile)}>
      {children}
    </Shell>
  );
}
