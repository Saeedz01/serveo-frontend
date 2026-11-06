import type { ServiceCategoryDto } from "@/service/api";

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "i",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "please",
  "the",
  "to",
  "we",
  "with",
  "you",
  "your",
  "need",
  "needed",
  "looking",
  "want",
  "help",
  "service",
  "services",
]);

function normalize(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreCategory(
  category: ServiceCategoryDto,
  haystack: string,
): number {
  if (!haystack || category.slug === "other-services") return 0;
  let score = 0;
  for (const keyword of category.keywords ?? []) {
    const needle = keyword.trim().toLowerCase();
    if (needle.length < 2) continue;
    if (haystack.includes(needle)) {
      score += needle.length >= 5 ? 2 : 1;
    }
  }
  const nameTokens = category.name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
  for (const token of nameTokens) {
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

/** Top category suggestions from title/description/specialty keyword hits. */
export function suggestCategories(
  categories: ServiceCategoryDto[],
  input: {
    title?: string;
    description?: string;
    specialty?: string;
  },
  limit = 3,
): ServiceCategoryDto[] {
  const haystack = normalize(input.title, input.description, input.specialty);
  if (!haystack) return [];

  return [...categories]
    .map((category) => ({
      category,
      score: scoreCategory(category, haystack),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.category.name.localeCompare(b.category.name))
    .slice(0, limit)
    .map((row) => row.category);
}

/** Strongest non-Other suggestion for a specialty string (Did you mean…). */
export function suggestCategoryFromSpecialty(
  categories: ServiceCategoryDto[],
  specialty: string,
): ServiceCategoryDto | null {
  const [top] = suggestCategories(categories, { specialty }, 1);
  return top ?? null;
}

export function isOtherServicesCategory(
  categories: ServiceCategoryDto[],
  categoryId: string,
): boolean {
  const slug = categories.find((category) => category.id === categoryId)?.slug;
  return Boolean(
    slug &&
      (slug === "other-services" || slug.startsWith("other-services-")),
  );
}
