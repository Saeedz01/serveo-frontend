"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button, Typography } from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import { SiteLogo } from "@/components/marketing/site-logo";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/identities", label: "Identity verification", icon: ShieldCheck },
  { href: "/admin/services", label: "Services", icon: ClipboardList },
  { href: "/admin/cities", label: "Cities", icon: MapPin },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: MessageSquare,
    badge: "messages" as const,
  },
] as const;

function NavBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={cx(
        "ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[length:var(--text-xs)] font-semibold",
        active ? "bg-white text-primary" : "bg-error text-white",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function isLoginPath(pathname: string) {
  return pathname === "/admin/login";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, adminAuthenticated, logoutAdmin } = usePrototype();
  const { unreadCount: unreadMessages } = useChat();
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!ready || loggingOutRef.current) return;
    if (!isLoginPath(pathname) && !adminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [adminAuthenticated, pathname, ready, router]);

  const handleLogout = () => {
    loggingOutRef.current = true;
    logoutAdmin();
    router.replace("/");
  };

  if (isLoginPath(pathname)) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-secondary">
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
      <div className="flex min-h-full flex-1 items-center justify-center bg-secondary">
        <Typography variant="body" className="text-muted">
          Checking admin session...
        </Typography>
      </div>
    );
  }

  const linkBadge = (link: (typeof links)[number]) =>
    "badge" in link && link.badge === "messages" ? unreadMessages : 0;

  return (
    <div className="flex min-h-full flex-1 bg-secondary">
      <aside className="sticky top-0 z-20 hidden h-svh w-64 shrink-0 flex-col border-r border-border/80 bg-surface/90 px-[var(--space-4)] py-[var(--space-5)] backdrop-blur-md lg:flex">
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
            const badgeCount = linkBadge(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  "flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-sm)] font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-16px_rgba(92,61,145,0.75)]"
                    : "text-foreground hover:bg-primary-soft hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{link.label}</span>
                <NavBadge count={badgeCount} active={active} />
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
        <div className="border-b border-border/80 bg-surface/95 px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-md lg:hidden">
          <div className="mb-[var(--space-3)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <SiteLogo />
              <Typography variant="caption" className="mt-1 block text-muted">
                Admin console
              </Typography>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-9 min-h-9 shrink-0 px-3 text-[length:var(--text-sm)]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </Button>
          </div>
          <nav
            aria-label="Admin mobile"
            className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              const badgeCount = linkBadge(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cx(
                    "inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-full)] px-3.5 py-2 text-[length:var(--text-sm)] font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-primary-soft hover:text-primary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {link.label}
                  {badgeCount > 0 ? (
                    <span
                      className={cx(
                        "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[length:var(--text-xs)] font-semibold",
                        active ? "bg-white text-primary" : "bg-error text-white",
                      )}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="flex flex-1 flex-col px-[var(--space-4)] py-[var(--space-5)] sm:px-[var(--space-5)] sm:py-[var(--space-6)] lg:px-[var(--space-8)]">
          {children}
        </main>
      </div>
    </div>
  );
}
