"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { SiteLogo } from "./site-logo";
import { SiteNavLinks } from "./site-nav-links";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <Container className="flex h-12 items-center justify-between gap-[var(--space-4)]">
        <SiteLogo />

        <SiteNavLinks className="hidden md:flex" />

        <div className="flex items-center gap-[var(--space-2)]">
          <Button
            as="a"
            href="/admin/dashboard"
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
          >
            Become provider
          </Button>

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
          <Container className="py-[var(--space-3)]">
            <SiteNavLinks
              className="flex-col items-start gap-[var(--space-1)]"
              onNavigate={() => setOpen(false)}
            />
          </Container>
        </div>
      ) : null}
    </header>
  );
}
