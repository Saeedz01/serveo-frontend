"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { Button, Container } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { isSeekerAccount } from "@/lib/prototype-types";
import {
  clearGuestMode,
  enableGuestMode,
  isGuestMode,
} from "@/lib/guest-mode";
import { clearAuthSession, getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import { SiteLogo } from "./site-logo";
import { SiteNavLinks } from "./site-nav-links";

function dashboardHref(input: {
  seekerLoggedIn: boolean;
  isProviderLoggedIn: boolean;
  adminAuthenticated: boolean;
  authRole?: string | null;
}) {
  if (input.seekerLoggedIn || input.authRole === "SEEKER") {
    return "/seeker/dashboard";
  }
  if (input.isProviderLoggedIn || input.authRole === "PROVIDER") {
    return "/provider/dashboard";
  }
  if (input.adminAuthenticated || input.authRole === "ADMIN") {
    return "/admin/dashboard";
  }
  return "/seeker/dashboard";
}

export function SiteHeader() {
  const router = useRouter();
  const {
    ready,
    currentProvider,
    currentSeeker,
    adminAuthenticated,
    logout,
    logoutAdmin,
    clearSeekerSession,
  } = usePrototype();
  const [open, setOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const isProviderLoggedIn =
    ready &&
    (Boolean(currentProvider) ||
      (authUser?.role === "PROVIDER" && hasToken));
  const seekerLoggedIn =
    ready &&
    ((authUser?.role === "SEEKER" && hasToken) ||
      isSeekerAccount(currentSeeker));
  const hasGuestSeekerSession =
    ready &&
    Boolean(currentSeeker) &&
    !isSeekerAccount(currentSeeker) &&
    !(authUser?.role === "SEEKER" && hasToken);
  const isLoggedIn =
    isProviderLoggedIn ||
    seekerLoggedIn ||
    Boolean(adminAuthenticated) ||
    (authUser?.role === "ADMIN" && hasToken);
  const showGuestNav = !isLoggedIn && (guestMode || hasGuestSeekerSession);
  const showLoggedOutActions = ready && !isLoggedIn;
  const accountDashboardHref = dashboardHref({
    seekerLoggedIn,
    isProviderLoggedIn,
    adminAuthenticated: Boolean(adminAuthenticated),
    authRole: authUser?.role,
  });
  const accountLabel =
    authUser?.name?.trim() ||
    currentSeeker?.name?.trim() ||
    currentProvider?.name?.trim() ||
    "Account";

  useEffect(() => {
    setGuestMode(isGuestMode());
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      clearGuestMode();
      setGuestMode(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!loginMenuOpen && !accountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        loginMenuOpen &&
        loginMenuRef.current &&
        !loginMenuRef.current.contains(target)
      ) {
        setLoginMenuOpen(false);
      }
      if (
        accountMenuOpen &&
        accountMenuRef.current &&
        !accountMenuRef.current.contains(target)
      ) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [accountMenuOpen, loginMenuOpen]);

  const handleLogout = () => {
    clearAuthSession();
    if (isProviderLoggedIn) logout();
    if (seekerLoggedIn || hasGuestSeekerSession) clearSeekerSession();
    if (adminAuthenticated) logoutAdmin();
    clearGuestMode();
    setGuestMode(false);
    setOpen(false);
    setLoginMenuOpen(false);
    setAccountMenuOpen(false);
    router.replace("/");
  };

  const handleGoAsGuest = () => {
    enableGuestMode();
    setGuestMode(true);
    setOpen(false);
    setLoginMenuOpen(false);
    router.push("/services");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <Container className="flex h-12 items-center justify-between gap-[var(--space-4)]">
        <SiteLogo />

        <SiteNavLinks
          className="hidden md:flex"
          showAdmin={showLoggedOutActions}
          showGuestLinks={showGuestNav}
          showPostJob={seekerLoggedIn}
          showSeekerDashboard={false}
        />

        <div className="flex items-center gap-[var(--space-2)]">
          {showGuestNav ? (
            <>
              <Button
                as="a"
                href="/jobs/new"
                variant="ghost"
                className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex md:hidden"
              >
                Post a job
              </Button>
              <Button
                as="a"
                href="/seeker/dashboard"
                variant="ghost"
                className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex md:hidden"
              >
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Dashboard
              </Button>
            </>
          ) : null}

          {isLoggedIn ? (
            <div ref={accountMenuRef} className="relative">
              <Button
                type="button"
                variant="secondary"
                className="h-8 min-h-8 max-w-[11rem] rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                onClick={() => setAccountMenuOpen((value) => !value)}
              >
                <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{accountLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </Button>
              {accountMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-[var(--radius-md)] border border-border bg-background shadow-lg"
                >
                  <a
                    role="menuitem"
                    href={accountDashboardHref}
                    className="flex items-center gap-2 px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-foreground transition-colors hover:bg-muted/40"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                    Dashboard
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[length:var(--text-sm)] font-medium text-foreground transition-colors hover:bg-muted/40"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {showLoggedOutActions ? (
            <>
              {!showGuestNav ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex"
                  onClick={handleGoAsGuest}
                >
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  Go as guest
                </Button>
              ) : null}

              <div ref={loginMenuRef} className="relative hidden sm:block">
                <Button
                  type="button"
                  className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
                  aria-expanded={loginMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setLoginMenuOpen((value) => !value)}
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden />
                  Login
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                </Button>
                {loginMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-[var(--radius-md)] border border-border bg-background shadow-lg"
                  >
                    <a
                      role="menuitem"
                      href="/provider/login"
                      className="block px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-foreground transition-colors hover:bg-muted/40"
                      onClick={() => setLoginMenuOpen(false)}
                    >
                      Login as provider
                    </a>
                    <a
                      role="menuitem"
                      href="/seeker/login"
                      className="block px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-foreground transition-colors hover:bg-muted/40"
                      onClick={() => setLoginMenuOpen(false)}
                    >
                      Login as seeker
                    </a>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-foreground md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-background md:hidden"
        >
          <Container className="flex flex-col gap-[var(--space-2)] py-[var(--space-3)]">
            <SiteNavLinks
              className="flex-col items-start gap-[var(--space-1)]"
              onNavigate={() => setOpen(false)}
              showAdmin={showLoggedOutActions}
              showGuestLinks={showGuestNav}
              showPostJob={seekerLoggedIn}
              showSeekerDashboard={false}
            />

            {isLoggedIn ? (
              <>
                <Button
                  as="a"
                  href={accountDashboardHref}
                  variant="secondary"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Dashboard
                </Button>
                <Button
                  type="button"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Log out
                </Button>
              </>
            ) : null}

            {showLoggedOutActions ? (
              <>
                {!showGuestNav ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                    onClick={handleGoAsGuest}
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                    Go as guest
                  </Button>
                ) : null}
                <Button
                  as="a"
                  href="/provider/login"
                  variant="secondary"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={() => setOpen(false)}
                >
                  Login as provider
                </Button>
                <Button
                  as="a"
                  href="/seeker/login"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={() => setOpen(false)}
                >
                  Login as seeker
                </Button>
              </>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
