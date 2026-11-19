"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { Button, Typography } from "@/components/ui";
import { SiteLogo } from "@/components/marketing/site-logo";
import { useChat } from "@/components/chat/chat-provider";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";
import {
  clearAuthSession,
  clearExpiredAuthSession,
  getStoredAuthUser,
  hasValidAuthSession,
  redirectToLogin,
} from "@/service/auth-session";
import {
  useGetMyBookingsQuery,
  useGetMyJobsQuery,
  type AuthUser,
} from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";
import {
  parseSeekerTab,
  type SeekerDashboardTab,
} from "@/lib/seeker-dashboard-tab";
import { SeekerRealtimeSync } from "./seeker-realtime-sync";

export type { SeekerDashboardTab } from "@/lib/seeker-dashboard-tab";
export { parseSeekerTab } from "@/lib/seeker-dashboard-tab";

const navItems: Array<{
  tab: SeekerDashboardTab;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: "requests" | "jobs" | "messages";
}> = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "requests", label: "Requests", icon: ClipboardList, badge: "requests" },
  { tab: "jobs", label: "Your posted jobs", icon: Briefcase, badge: "jobs" },
  { tab: "messages", label: "Messages", icon: MessageSquare, badge: "messages" },
];

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

function tabHref(tab: SeekerDashboardTab, thread?: string | null) {
  if (tab === "overview") return "/seeker/dashboard";
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (tab === "messages" && thread) params.set("thread", thread);
  return `/seeker/dashboard?${params.toString()}`;
}

export function SeekerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, clearSeekerSession, currentSeeker } = usePrototype();
  const { unreadCount: unreadMessages } = useChat();
  // Session is localStorage-backed — only read after mount to match SSR HTML.
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    clearExpiredAuthSession();
    const user = getStoredAuthUser();
    setAuthUser(user);
    setHasToken(Boolean(getAccessToken()) && hasValidAuthSession("SEEKER"));
    setSessionReady(true);
  }, [pathname, ready]);

  const seekerLoggedIn = authUser?.role === "SEEKER" && hasToken;
  const onJobsPath = pathname.startsWith("/jobs");
  const activeTab = onJobsPath
    ? "jobs"
    : parseSeekerTab(searchParams.get("tab"));
  const thread = searchParams.get("thread");

  const { data: bookings = [] } = useGetMyBookingsQuery(undefined, {
    skip: !seekerLoggedIn,
  });
  const { data: jobs = [] } = useGetMyJobsQuery(undefined, {
    skip: !seekerLoggedIn,
  });

  useEffect(() => {
    if (!ready || !sessionReady) return;
    if (!pathname.startsWith("/seeker/dashboard")) return;
    if (!seekerLoggedIn) {
      clearSeekerSession();
      redirectToLogin({ role: "SEEKER", pathname });
    }
  }, [clearSeekerSession, pathname, ready, seekerLoggedIn, sessionReady]);

  const requestCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "pending" || booking.status === "negotiating",
      ).length,
    [bookings],
  );
  const openJobCount = useMemo(
    () => jobs.filter((job) => job.status === "open").length,
    [jobs],
  );

  const handleLogout = () => {
    clearAuthSession();
    clearSeekerSession();
    router.replace("/");
  };

  const displayName =
    currentSeeker?.name?.trim() ||
    authUser?.name?.trim() ||
    "Seeker";

  return (
    <div className="flex min-h-full flex-1 bg-secondary">
      <SeekerRealtimeSync enabled={seekerLoggedIn} />
      <aside className="sticky top-0 z-20 hidden h-svh w-64 shrink-0 flex-col border-r border-border/80 bg-surface/95 px-[var(--space-4)] py-[var(--space-5)] backdrop-blur-md lg:flex">
        <div className="mb-[var(--space-6)] space-y-[var(--space-3)]">
          <SiteLogo />
          <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/50 p-[var(--space-3)]">
            <Typography variant="caption" className="mb-1 block text-muted">
              Seeker workspace
            </Typography>
            <Typography variant="label" className="block truncate">
              {displayName}
            </Typography>
          </div>
        </div>

        <nav
          aria-label="Seeker dashboard"
          className="flex flex-1 flex-col gap-1 overflow-y-auto"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.tab;
            const badgeCount =
              item.badge === "requests"
                ? requestCount
                : item.badge === "jobs"
                  ? openJobCount
                  : item.badge === "messages"
                    ? unreadMessages
                    : 0;

            return (
              <Link
                key={item.tab}
                href={tabHref(item.tab, thread)}
                className={cx(
                  "flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-sm)] font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-16px_rgba(92,61,145,0.75)]"
                    : "text-foreground hover:bg-primary-soft hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
                <NavBadge count={badgeCount} active={active} />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-[var(--space-2)] border-t border-border pt-[var(--space-4)]">
          <Button
            as="a"
            href="/jobs/new"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Post a job
          </Button>
          <Button
            as="a"
            href="/"
            variant="secondary"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
          >
            <Search className="h-4 w-4" aria-hidden />
            Browse services
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 min-h-10 w-full justify-start px-3 text-[length:var(--text-sm)]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border/80 bg-surface/95 px-[var(--space-4)] py-[var(--space-3)] backdrop-blur-md lg:hidden">
          <div className="mb-[var(--space-3)] flex items-center justify-between gap-3">
            <SiteLogo />
            <div className="flex shrink-0 items-center gap-1">
              <Button
                as="a"
                href="/jobs/new"
                className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
                aria-label="Post a job"
              >
                <Plus className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Post job</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
          <nav
            aria-label="Seeker dashboard mobile"
            className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.tab;
              const badgeCount =
                item.badge === "requests"
                  ? requestCount
                  : item.badge === "jobs"
                    ? openJobCount
                    : item.badge === "messages"
                      ? unreadMessages
                      : 0;
              return (
                <Link
                  key={item.tab}
                  href={tabHref(item.tab, thread)}
                  className={cx(
                    "inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-full)] px-3.5 py-2 text-[length:var(--text-sm)] font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-primary-soft hover:text-primary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {item.label}
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
