"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button, Typography } from "@/components/ui";
import { SiteLogo } from "@/components/marketing/site-logo";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/identities", label: "Identity verification", icon: ShieldCheck },
  { href: "/admin/services", label: "Services", icon: ClipboardList },
] as const;

function isLoginPath(pathname: string) {
  return pathname === "/admin/login";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, adminAuthenticated, logoutAdmin } = usePrototype();

  useEffect(() => {
    if (!ready) return;
    if (!isLoginPath(pathname) && !adminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [adminAuthenticated, pathname, ready, router]);

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  if (isLoginPath(pathname)) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-[radial-gradient(circle_at_88%_0%,var(--primary-soft),transparent_40%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
        <header className="border-b border-border/80 bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex h-12 w-full max-w-[var(--container-max)] items-center justify-between px-[var(--space-4)] sm:px-[var(--space-6)]">
            <SiteLogo />
            <Typography variant="caption" className="text-muted">
              Admin console
            </Typography>
          </div>
        </header>
        <main className="flex flex-1 items-start justify-center px-[var(--space-4)] py-[var(--space-8)] sm:px-[var(--space-6)]">
          {children}
        </main>
      </div>
    );
  }

  if (!ready || !adminAuthenticated) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[radial-gradient(circle_at_100%_0%,var(--primary-soft),transparent_32%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
        <Typography variant="body" className="text-muted">
          Checking admin session...
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 bg-[radial-gradient(circle_at_100%_0%,var(--primary-soft),transparent_32%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
      <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col border-r border-border/80 bg-surface/90 px-[var(--space-4)] py-[var(--space-5)] backdrop-blur-md">
        <div className="mb-[var(--space-6)] space-y-[var(--space-3)]">
          <SiteLogo />
          <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/50 p-[var(--space-3)]">
            <Typography variant="caption" className="mb-1 block text-muted">
              Admin console
            </Typography>
            <Typography variant="label" className="block">
              Marketplace operations
            </Typography>
          </div>
        </div>

        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  "flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-sm)] font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-16px_rgba(109,40,217,0.8)]"
                    : "text-foreground hover:bg-primary-soft hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-[var(--space-2)] border-t border-border pt-[var(--space-4)]">
          <Button
            type="button"
            variant="secondary"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </Button>
          <Button
            as="a"
            href="/"
            variant="ghost"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
          >
            Back to site
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex flex-1 flex-col px-[var(--space-5)] py-[var(--space-6)] lg:px-[var(--space-8)]">
          {children}
        </main>
      </div>
    </div>
  );
}
