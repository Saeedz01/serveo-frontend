import Link from "next/link";
import { Typography } from "@/components/ui";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-primary"
        aria-hidden
      >
        <span className="h-2 w-2 rounded-full bg-primary-foreground" />
      </span>
      <Typography
        variant="nav"
        as="span"
        className="font-[family-name:var(--font-display)] text-[length:var(--text-base)] font-bold tracking-tight text-foreground"
      >
        Serveo
      </Typography>
    </Link>
  );
}
