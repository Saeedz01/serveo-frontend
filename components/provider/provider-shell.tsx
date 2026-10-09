"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck2,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  UserRound,
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
import { unreadBookingMessagesForProvider } from "@/lib/prototype-chat";

const links = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/bookings", label: "Bookings", icon: CalendarCheck2, badge: "bookings" as const },
  { href: "/provider/messages", label: "Messages", icon: MessageSquare },
  { href: "/provider/availability", label: "Availability", icon: CalendarClock },
  { href: "/provider/notifications", label: "Notifications", icon: Bell, badge: "notifications" as const },
  { href: "/provider/services", label: "My services", icon: Wrench },
  { href: "/provider/services/new", label: "Create service", icon: PlusCircle },
  { href: "/provider/profile", label: "Edit profile", icon: UserRound },
] as const;

function isAuthPath(pathname: string) {
  return pathname === "/provider/login" || pathname === "/provider/signup";
}

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

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    ready,
    currentProvider,
    state,
    logout,
    bookingsForProvider,
    notificationsForProvider,
  } = usePrototype();
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!ready || loggingOutRef.current) return;
    if (!isAuthPath(pathname) && !currentProvider) {
      router.replace("/provider/login");
    }
  }, [currentProvider, pathname, ready, router]);

  const handleLogout = () => {
    loggingOutRef.current = true;
    logout();
    router.replace("/");
  };

  if (isAuthPath(pathname)) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-secondary">
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
      <div className="flex min-h-full flex-1 items-center justify-center bg-secondary">
        <Typography variant="body" className="text-muted">
          Checking provider session...
        </Typography>
      </div>
    );
  }

  // Badge only for action needed: brand-new pending requests + unread seeker messages.
  // Negotiating / already-open requests do not inflate the count by themselves.
  const newPendingRequests = bookingsForProvider(currentProvider.id).filter(
    (booking) => booking.status === "pending",
  ).length;
  const unreadBookingMessages = unreadBookingMessagesForProvider(
    state,
    currentProvider.id,
  );
  const bookingsBadge = newPendingRequests + unreadBookingMessages;
  const unreadNotifications = notificationsForProvider(currentProvider.id).filter(
    (item) => !item.read,
  ).length;

  return (
    <div className="flex min-h-full flex-1 bg-secondary">
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

        <nav aria-label="Provider" className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/provider/services"
                ? pathname === "/provider/services"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const badgeCount =
              "badge" in link && link.badge === "bookings"
                ? bookingsBadge
                : "badge" in link && link.badge === "notifications"
                  ? unreadNotifications
                  : 0;

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
