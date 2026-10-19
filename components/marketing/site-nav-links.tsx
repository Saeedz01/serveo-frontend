import Link from "next/link";
import { cx } from "@/lib/cx";

type SiteNavLinksProps = {
  className?: string;
  onNavigate?: () => void;
  showAdmin?: boolean;
  showGuestLinks?: boolean;
  /** Seeker/guest job posting link in the primary nav. */
  showPostJob?: boolean;
  showSeekerDashboard?: boolean;
};

export function SiteNavLinks({
  className,
  onNavigate,
  showAdmin = false,
  showGuestLinks = false,
  showPostJob = false,
  showSeekerDashboard = false,
}: SiteNavLinksProps) {
  const links = [
    { href: "/services", label: "Services" },
    { href: "/how-it-works", label: "How it works" },
    ...(showAdmin ? [{ href: "/admin/login", label: "Admin" }] : []),
    ...(showGuestLinks || showPostJob
      ? [{ href: "/jobs/new", label: "Post a job" }]
      : []),
    ...(showGuestLinks || showSeekerDashboard
      ? [{ href: "/seeker/dashboard", label: "Dashboard" }]
      : []),
  ] as const;

  return (
    <nav aria-label="Primary" className={cx("flex items-center", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="px-3 py-1 text-[length:var(--text-sm)] font-medium text-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
