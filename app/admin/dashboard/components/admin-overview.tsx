"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";
import { Button, PageHeader, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";

export function AdminOverview() {
  const { ready, state } = usePrototype();

  if (!ready) {
    return <Typography variant="body">Loading admin overview...</Typography>;
  }

  const pending = state.providers.filter((p) => p.status === "pending").length;
  const verified = state.providers.filter((p) => p.status === "verified").length;
  const published = state.services.filter((s) => s.status === "published").length;
  const suspended = state.services.filter((s) => s.status === "suspended").length;

  const cards = [
    {
      label: "Pending identities",
      value: pending,
      href: "/admin/identities",
      icon: ShieldAlert,
      accent: "bg-amber-50 text-warning",
    },
    {
      label: "Verified providers",
      value: verified,
      href: "/admin/identities",
      icon: BadgeCheck,
      accent: "bg-emerald-50 text-success",
    },
    {
      label: "Published services",
      value: published,
      href: "/admin/services",
      icon: ClipboardList,
      accent: "bg-primary-soft text-primary",
    },
    {
      label: "Suspended services",
      value: suspended,
      href: "/admin/services",
      icon: Ban,
      accent: "bg-red-50 text-error",
    },
  ];

  const recentPending = state.providers
    .filter((provider) => provider.status === "pending")
    .slice(0, 3);

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Control center"
        title="Admin overview"
        description="Verify provider identities and moderate marketplace services in one place."
      />

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_18px_40px_-30px_rgba(10,10,10,0.35)]"
            >
              <div
                className={`mb-[var(--space-4)] inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] ${card.accent}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <Typography variant="caption" className="mb-[var(--space-2)] block text-muted">
                {card.label}
              </Typography>
              <Typography variant="h2">{card.value}</Typography>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-[var(--space-5)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
          <Typography variant="h3" className="mb-[var(--space-4)]">
            Needs attention
          </Typography>
          {recentPending.length === 0 ? (
            <Typography variant="body" className="text-muted">
              No pending identity reviews right now.
            </Typography>
          ) : (
            <ul className="space-y-[var(--space-3)]">
              {recentPending.map((provider) => (
                <li
                  key={provider.id}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] bg-secondary px-[var(--space-4)] py-[var(--space-3)]"
                >
                  <div>
                    <Typography variant="label" className="block">
                      {provider.name}
                    </Typography>
                    <Typography variant="caption" className="text-muted">
                      {provider.phone}
                    </Typography>
                  </div>
                  <Button
                    as="a"
                    href="/admin/identities"
                    className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
                  >
                    Review
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-primary bg-primary p-[var(--space-5)] text-primary-foreground">
          <div>
            <Typography variant="h3" className="mb-[var(--space-2)] text-primary-foreground">
              Quick actions
            </Typography>
            <Typography variant="body" className="text-primary-foreground/90">
              Jump straight into verification or service moderation.
            </Typography>
          </div>
          <div className="mt-[var(--space-5)] flex flex-col gap-[var(--space-3)]">
            <Button
              as="a"
              href="/admin/identities"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
            >
              Review identities
            </Button>
            <Button
              as="a"
              href="/admin/services"
              variant="onPrimary"
              className="rounded-[var(--radius-full)]"
            >
              Moderate services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
