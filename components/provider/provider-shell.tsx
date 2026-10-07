"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck2,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Wrench,
} from "lucide-react";
import {
  Button,
  ProviderStatusChip,
  Typography,
} from "@/components/ui";
import { SiteLogo } from "@/components/marketing/site-logo";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";

const links = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/provider/services", label: "My services", icon: Wrench },
  { href: "/provider/services/new", label: "Create service", icon: PlusCircle },
] as const;

function isAuthPath(pathname: string) {
  return pathname === "/provider/login" || pathname === "/provider/signup";
}

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentProvider, logout } = usePrototype();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthPath(pathname) && !currentProvider) {
      router.replace("/provider/login");
    }
  }, [currentProvider, pathname, ready, router]);

  const handleLogout = () => {
    logout();
    router.push("/provider/login");
  };

  if (isAuthPath(pathname)) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-[radial-gradient(circle_at_12%_0%,var(--primary-soft),transparent_40%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
        <header className="border-b border-border/80 bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex h-12 w-full max-w-[var(--container-max)] items-center justify-between px-[var(--space-4)] sm:px-[var(--space-6)]">
            <SiteLogo />
            <div className="flex items-center gap-[var(--space-2)]">
              <Button
                as="a"
                href="/provider/login"
                variant={pathname === "/provider/login" ? "primary" : "ghost"}
                className="h-8 min-h-8 px-3 text-[length:var(--text-sm)]"
              >
                Log in
              </Button>
              <Button
                as="a"
                href="/provider/signup"
                variant={pathname === "/provider/signup" ? "primary" : "secondary"}
                className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
              >
                Sign up
              </Button>
            </div>
          </div>
        </header>
        <main className="flex flex-1 items-start justify-center px-[var(--space-4)] py-[var(--space-8)] sm:px-[var(--space-6)]">
          {children}
        </main>
      </div>
    );
  }

  if (!ready || !currentProvider) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[radial-gradient(circle_at_12%_0%,var(--primary-soft),transparent_40%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
        <Typography variant="body" className="text-muted">
          Checking provider session...
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 bg-[radial-gradient(circle_at_0%_0%,var(--primary-soft),transparent_34%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
      <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col border-r border-border/80 bg-surface/90 px-[var(--space-4)] py-[var(--space-5)] backdrop-blur-md">
        <div className="mb-[var(--space-6)] space-y-[var(--space-3)]">
          <SiteLogo />
          <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/50 p-[var(--space-3)]">
            <Typography variant="caption" className="mb-1 block text-muted">
              Provider workspace
            </Typography>
            <Typography variant="label" className="mb-2 block truncate">
              {currentProvider.name}
            </Typography>
            <ProviderStatusChip status={currentProvider.status} />
          </div>
        </div>

        <nav aria-label="Provider" className="flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/provider/services"
                ? pathname === "/provider/services"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  "group flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-sm)] font-medium transition-all",
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
            as="a"
            href="/"
            variant="ghost"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
          >
            Back to site
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
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
