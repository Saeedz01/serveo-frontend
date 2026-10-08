"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { Button, Container } from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { SiteLogo } from "./site-logo";
import { SiteNavLinks } from "./site-nav-links";

export function SiteHeader() {
  const router = useRouter();
  const { ready, currentProvider, currentSeeker, logout, clearSeekerSession } =
    usePrototype();
  const { unreadCount } = useChat();
  const [open, setOpen] = useState(false);
  const isProviderLoggedIn = ready && Boolean(currentProvider);
  const hasSeekerSession = ready && Boolean(currentSeeker);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.replace("/");
  };

  const handleClearSeeker = () => {
    clearSeekerSession();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <Container className="flex h-12 items-center justify-between gap-[var(--space-4)]">
        <SiteLogo />

        <SiteNavLinks className="hidden md:flex" />

        <div className="flex items-center gap-[var(--space-2)]">
          <Button
            as="a"
            href="/requests"
            variant="ghost"
            className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex"
          >
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            My requests
          </Button>
          {hasSeekerSession ? (
            <Button
              as="a"
              href="/messages"
              variant="ghost"
              className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              Messages
              {unreadCount > 0 ? (
                <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[length:var(--text-xs)] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Button>
          ) : null}

          {isProviderLoggedIn ? (
            <>
              <Button
                as="a"
                href="/provider/dashboard"
                variant="ghost"
                className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex"
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                Dashboard
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                as="a"
                href="/provider/login"
                variant="ghost"
                className="hidden h-8 min-h-8 px-3 text-[length:var(--text-sm)] sm:inline-flex"
              >
                Provider login
              </Button>
              <Button
                as="a"
                href="/provider/signup"
                className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
              >
                Become provider
              </Button>
            </>
          )}

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
            />
            <Button
              as="a"
              href="/requests"
              variant="secondary"
              className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
              onClick={() => setOpen(false)}
            >
              <ClipboardList className="h-4 w-4" aria-hidden />
              My requests
            </Button>
            {hasSeekerSession ? (
              <>
                <Button
                  as="a"
                  href="/messages"
                  variant="secondary"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={() => setOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" aria-hidden />
                  Messages
                  {unreadCount > 0 ? ` (${unreadCount})` : ""}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={handleClearSeeker}
                >
                  End messaging session
                </Button>
              </>
            ) : null}
            {isProviderLoggedIn ? (
              <>
                <Button
                  as="a"
                  href="/provider/dashboard"
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
            ) : (
              <>
                <Button
                  as="a"
                  href="/provider/login"
                  variant="secondary"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={() => setOpen(false)}
                >
                  Provider login
                </Button>
                <Button
                  as="a"
                  href="/provider/signup"
                  className="h-9 min-h-9 w-full rounded-[var(--radius-full)] text-[length:var(--text-sm)]"
                  onClick={() => setOpen(false)}
                >
                  Become provider
                </Button>
              </>
            )}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
