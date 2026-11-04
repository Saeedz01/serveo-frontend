/** Common words that should not drive marketplace search matches. */
const SEARCH_STOPWORDS = new Set([
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
  "near",
  "of",
  "on",
  "or",
  "our",
  "please",
  "service",
  "services",
  "the",
  "to",
  "we",
  "with",
  "you",
  "your",
]);

/**
 * Split a seeker query into meaningful keywords, dropping stopwords and
 * very short tokens so phrases like "catering services in Lahore" become
 * ["catering", "lahore"].
 */
export function extractSearchKeywords(query: string): string[] {
  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const token of normalized.split(" ")) {
    if (token.length < 2 || SEARCH_STOPWORDS.has(token) || seen.has(token)) {
      continue;
    }
    seen.add(token);
    keywords.push(token);
  }

  return keywords;
}

/** True when at least one keyword appears in the searchable text. */
export function matchesAnyKeyword(
  haystack: string,
  keywords: string[],
): boolean {
  if (keywords.length === 0) return false;
  const text = haystack.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
}

/** Count of query keywords found in the searchable text (for ranking). */
export function scoreKeywordMatches(
  haystack: string,
  keywords: string[],
): number {
  if (keywords.length === 0) return 0;
  const text = haystack.toLowerCase();
  return keywords.reduce(
    (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
    0,
  );
}
