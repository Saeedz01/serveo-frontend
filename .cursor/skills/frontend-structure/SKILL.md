---
name: frontend-structure
description: >-
  Project frontend file organization for Serveo. Use when creating pages,
  components, routes, or restructuring the Next.js App Router app folder.
---

# Serveo Frontend Structure

## Route groups

All pages live under one of:

- `app/(marketing)/` — public marketing pages
- `app/admin/` — admin pages (`/admin/...`)

## Page folders

Each page has its own folder containing:

```text
page-name/
  page.tsx
  components/
    section-a.tsx
    section-b.tsx
```

Home uses a route group so `/` stays clean:

```text
app/(marketing)/(home)/page.tsx
app/(marketing)/(home)/components/
```

## page.tsx rule

`page.tsx` only imports and composes components. No inline UI markup beyond composition.

```tsx
import { Hero } from "./components/hero";
import { CtaActions } from "./components/cta-actions";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CtaActions />
    </>
  );
}
```

## Shared UI

- Reusable UI (used more than once) → `components/ui/`
- Central typography system → `components/ui/typography.tsx` (and related tokens in `app/globals.css`)
- Page-specific UI → that page's `components/` folder

## Hard rules

1. **No source file may exceed 300 lines.** Split into components, hooks, or utilities before crossing the limit.
2. **UI used more than once must be a shared component** under `components/ui/` (or another shared location), not duplicated.
3. Prefer the project's typography/color/spacing tokens over ad-hoc styles.
4. **No gradients.** Do not use `linear-gradient`, `radial-gradient`, or Tailwind `bg-gradient-*`. Use solid token colors only.
