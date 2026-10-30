import Link from "next/link";
import { cx } from "@/lib/cx";

type SiteNavLinksProps = {
  className?: string;
  onNavigate?: () => void;
};

export function SiteNavLinks({ className, onNavigate }: SiteNavLinksProps) {
  const links = [
    { href: "/services", label: "Services" },
    { href: "/how-it-works", label: "How it works" },
  ] as const;

  return (
    <nav aria-label="Primary" className={cx("flex items-center", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="inline-flex min-h-10 items-center px-3 py-2 text-[length:var(--text-sm)] font-medium text-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
