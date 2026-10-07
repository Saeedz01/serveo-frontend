"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Container, SearchField, Typography } from "@/components/ui";
import {
  filterCatalogServices,
  serviceCategories,
} from "@/lib/services-catalog";
import { CategoryNav } from "./category-nav";
import { ServicesCards } from "./services-cards";

type ServicesExplorerProps = {
  showHeading?: boolean;
  showViewAll?: boolean;
  limit?: number;
};

export function ServicesExplorer({
  showHeading = true,
  showViewAll = false,
  limit,
}: ServicesExplorerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterCatalogServices({
        categoryId: activeId ?? undefined,
        query,
      }),
    [activeId, query],
  );

  const visible = typeof limit === "number" ? filtered.slice(0, limit) : filtered;

  return (
    <Container className="flex flex-col gap-[var(--space-6)]">
      {showHeading ? (
        <div className="mx-auto max-w-2xl text-center">
          <Typography variant="h2" className="mb-[var(--space-3)]">
            What do you need help with?
          </Typography>
          <Typography variant="bodyLarge">
            Search or pick a category to browse matching services.
          </Typography>
        </div>
      ) : null}

      <SearchField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for a service..."
        aria-label="Search services"
        wrapperClassName="mx-auto max-w-2xl"
      />

      <CategoryNav
        categories={serviceCategories}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <ServicesCards services={visible} />

      {showViewAll ? (
        <div className="flex justify-center pt-[var(--space-2)]">
          <Button
            as="a"
            href="/services"
            variant="secondary"
            className="rounded-[var(--radius-full)] px-6"
          >
            View all services
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </Container>
  );
}
