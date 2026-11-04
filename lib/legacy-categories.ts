/**
 * Maps legacy demo/catalog category ids to canonical system category slugs
 * (same mapping as backend seed LEGACY_CATEGORY_SLUGS).
 */
export const LEGACY_CATEGORY_SLUGS: Record<string, string> = {
  assembly: "home-repair-maintenance",
  cleaning: "cleaning-pest-control",
  moving: "moving-packers",
  outdoor: "gardening-landscaping",
  painting: "construction-renovation",
  repairs: "plumbing-water-services",
  trending: "events-catering-decorations",
};

/** True when a marketplace item belongs to the selected system category. */
export function matchesServiceCategory(
  itemCategoryId: string,
  selected: { id: string; slug: string } | null | undefined,
): boolean {
  if (!selected) return true;
  if (itemCategoryId === selected.id || itemCategoryId === selected.slug) {
    return true;
  }
  return LEGACY_CATEGORY_SLUGS[itemCategoryId] === selected.slug;
}
