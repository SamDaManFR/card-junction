import { EbaySearchResponse } from "./types";

type TokenCache = { token: string; expiresAtMs: number };
const cache: TokenCache = { token: "", expiresAtMs: 0 };

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function getEbayAppToken(): Promise<string> {
  const now = Date.now();
  if (cache.token && cache.expiresAtMs - 30_000 > now) return cache.token;

  const clientId = requiredEnv("EBAY_CLIENT_ID");
  const clientSecret = requiredEnv("EBAY_CLIENT_SECRET");
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Production endpoint; swap to api.sandbox.ebay.com if you’re using sandbox keys.
  const tokenUrl = "https://api.ebay.com/identity/v1/oauth2/token";

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    // Buy Browse scope (required to call the Browse API).
    // If your keyset doesn't include this scope yet, enable it in your eBay Developer account.
    scope: "https://api.ebay.com/oauth/api_scope"
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${basic}`,
    },
    body,
    // Avoid Next.js caching tokens between builds
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`eBay token error (${res.status}): ${t}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  cache.token = json.access_token;
  cache.expiresAtMs = now + json.expires_in * 1000;
  return cache.token;
}

export async function ebaySearch(params: {
  q: string;
  limit?: number;
  offset?: number;
  buyingOptions?: Array<"AUCTION" | "FIXED_PRICE">;
}): Promise<EbaySearchResponse> {
  const token = await getEbayAppToken();
  const marketplace = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";

  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", params.q);
  url.searchParams.set("limit", String(params.limit ?? 24));
  url.searchParams.set("offset", String(params.offset ?? 0));

  // Filter to sport trading cards categories + graded (conditionId 2750) when possible.
  // We also include keyword-based 'PSA' constraints in the query on the UI side.
  // Categories from eBay docs: 183050, 183454, 261328 (collectable card categories)
  // (We'll keep it simple: baseball cards typically in 261328, but we can OR categories by comma.)
  url.searchParams.set("category_ids", "261328");

  // Buying options: eBay returns FIXED_PRICE by default unless you use the buyingOptions filter.
  // We'll pass it when the user selects "auction" or "buy now".
  const filters: string[] = [];
  if (params.buyingOptions?.length) {
    filters.push(`buyingOptions:{${params.buyingOptions.join("|")}}`);
  }
  // Graded conditionId is 2750 per eBay trading card updates.
  filters.push("conditionIds:{2750}");

  url.searchParams.set("filter", filters.join(","));

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": marketplace,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`eBay search error (${res.status}): ${t}`);
  }
  return (await res.json()) as EbaySearchResponse;
}

export async function ebayGetItem(itemId: string): Promise<any> {
  const token = await getEbayAppToken();
  const marketplace = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";
  const url = `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(itemId)}`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": marketplace,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`eBay getItem error (${res.status}): ${t}`);
  }
  return await res.json();
}
