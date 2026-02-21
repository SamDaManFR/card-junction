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
  logoPath?: string; // <— add this
  // later: logoPath?: string; (e.g., "/logos/whatnot.svg")
  buildUrl: (q: string) => string;
};

export const marketplaces: MarketplaceLink[] = [
  {
    key: "whatnot",
    label: "Whatnot",
    logoPath: "/vendor logos/whatnot.png",
    buildUrl: (q) => `https://www.whatnot.com/search?query=${encodeURIComponent(q)}`,
  },
  {
    key: "goldin",
    label: "Goldin",
    logoPath: "/vendor logos/Goldin.png",
    //buildUrl: (q) =>`https://goldin.co/search?q=${encodeURIComponent(q)}`,
    buildUrl: (q) => `https://goldin.co/buy/?search=${encodeURIComponent(q)}&sort=Featured&page=1&number_of_lots=24`,
  },
  {
    key: "fanatics",
    label: "Fanatics Collect",
    logoPath: "/vendor logos/Fanatics.png",
    buildUrl: (q) => `https://www.fanaticscollect.com/marketplace?type=WEEKLY&q=${encodeURIComponent(q)}`,
  },
  {
    key: "alt",
    label: "ALT",
    logoPath: "/vendor logos/ALT.png",
    //buildUrl: (q) => `https://app.alt.xyz/browse?q=${encodeURIComponent(q)}`,
    buildUrl: (q) => `https://app.alt.xyz/browse?query=${encodeURIComponent(q)}&sortBy=newest_first`,
  },
  {
    key: "ebaylive",
    label: "eBay Live",
    //logoPath: "/vendor logos/whatnot.png",
    buildUrl: (q) => `https://www.ebay.com/e/lp/ebay-live?keyword=${encodeURIComponent(q)}`,
  },
  {
    key: "veriswap",
    label: "Veriswap",
    logoPath: "/vendor logos/veriswap.png",
    buildUrl: (_q) => `https://veriswap.com/search`,
  },
];
