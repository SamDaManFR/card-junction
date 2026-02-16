export function buildMarketplaceQuery(title: string): string {
  // Basic cleanup:
  // - remove common noise words
  // - strip bracketed phrases
  // - normalize whitespace
  // - keep years, card numbers, player names, set names
  const t = title
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(PSA|BGS|SGC|CGC|GRADED|SLAB|SLABBED|POP|AUTO|AUTOGRAPH|RC|ROOKIE|HOF|MVP|SSP|SP)\b/gi, " ")
    .replace(/\b(GEM\s*MINT|MINT|NM\s*MT|NM|MT)\b/gi, " ")
    .replace(/\b(CERT|CERTIFICATE|CERT#|CERTIFICATE#)\b/gi, " ")
    .replace(/\b\d{6,12}\b/g, " ") // likely cert numbers
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Limit length to keep search URLs reasonable
  return t.slice(0, 120);
}

export type MarketplaceLink = {
  key: string;
  label: string;
  // later: logoPath?: string; (e.g., "/logos/whatnot.svg")
  buildUrl: (q: string) => string;
};

export const marketplaces: MarketplaceLink[] = [
  {
    key: "whatnot",
    label: "Whatnot",
    buildUrl: (q) => `https://www.whatnot.com/search?query=${encodeURIComponent(q)}`,
  },
  {
    key: "goldin",
    label: "Goldin",
    buildUrl: (q) =>
    `https://goldin.co/search?q=${encodeURIComponent(q)}`,
  },
  {
    key: "fanatics",
    label: "Fanatics Collect",
    buildUrl: (q) => `https://www.fanaticscollect.com/search?query=${encodeURIComponent(q)}`,
  },
  {
    key: "alt",
    label: "ALT",
    buildUrl: (q) =>
    `https://www.google.com/search?q=site:alt.xyz+${encodeURIComponent(q)}`,
  },
  {
    key: "ebaylive",
    label: "eBay Live",
    buildUrl: (q) => `https://www.ebay.com/e/lp/ebay-live?keyword=${encodeURIComponent(q)}`,
  },
  {
    key: "veriswap",
    label: "Veriswap",
    buildUrl: (q) => `https://veriswap.com/search?q=${encodeURIComponent(q)}`,
  },
];
