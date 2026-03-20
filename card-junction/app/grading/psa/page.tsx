"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type Item = {
  itemId: string;
  title: string;
  itemWebUrl: string;
  image?: { imageUrl: string };
  price?: { value: string; currency: string };
  itemEndDate?: string;
  buyingOptions?: string[];
};

type PsaResult = {
  cert_number: string;
  title: string;
  year: string;
  brand: string;
  card_number: string;
  subject: string;
  grade: string;
  category: string;
  source: string;
  variety?: string;
  spec_id?: number;
  spec_number?: string;
  label_type?: string;
  total_population?: number;
  population_higher?: number;
  message?: string;
};

function formatMoney(p?: { value: string; currency: string }) {
  if (!p) return "—";
  const v = Number(p.value);
  if (Number.isNaN(v)) return `${p.value} ${p.currency}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: p.currency,
  }).format(v);
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
}

function getPriceNumber(p?: { value: string; currency: string }) {
  if (!p) return null;
  const n = Number(p.value);
  return Number.isFinite(n) ? n : null;
}

function buildEbaySearchQuery(result: PsaResult) {
  return [
    result.year,
    result.brand,
    result.subject,
    result.card_number ? `#${result.card_number}` : "",
    result.variety || "",
  ]
    .filter(Boolean)
    .join(" ");
}

function extractGrade(title: string): number | null {
  const match = title.match(/PSA\s?(\d{1,2})/i);
  return match ? Number(match[1]) : null;
}

function getGradeLabel(title: string) {
  const grade = extractGrade(title);
  if (grade === 10) return "PSA 10";
  if (grade === 9) return "PSA 9";
  if (grade === 8) return "PSA 8";
  return "Raw";
}

export default function Page() {
  const [certNumber, setCertNumber] = useState("");
  const [result, setResult] = useState<PsaResult | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [ebayQuery, setEbayQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [listingLoading, setListingLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const cert = certNumber.trim();

    if (!cert) {
      setError("Please enter a certification number.");
      setResult(null);
      setItems([]);
      setTotal(0);
      setEbayQuery("");
      return;
    }

    setLoading(true);
    setListingLoading(false);
    setError("");
    setResult(null);
    setItems([]);
    setTotal(0);
    setEbayQuery("");

    try {
      const res = await fetch(`http://127.0.0.1:8000/psa/${cert}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "PSA lookup failed.");
      }

      setResult(data);

      const query = buildEbaySearchQuery(data);
      setEbayQuery(query);
      setListingLoading(true);

      const ebayRes = await fetch(
        `/api/ebay/search?q=${encodeURIComponent(query)}&mode=all`
      );
      const ebayJson = await ebayRes.json();

      if (!ebayRes.ok) {
        throw new Error(ebayJson?.error || "eBay search failed");
      }

      const arr = (ebayJson.itemSummaries || []) as Item[];

      arr.sort((a, b) => {
        const ta = a.itemEndDate
          ? new Date(a.itemEndDate).getTime()
          : Number.POSITIVE_INFINITY;
        const tb = b.itemEndDate
          ? new Date(b.itemEndDate).getTime()
          : Number.POSITIVE_INFINITY;
        return ta - tb;
      });

      setItems(arr);
      setTotal(ebayJson.total || 0);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
      setListingLoading(false);
    }
  }

  const snapshot = useMemo(() => {
    const prices = items
      .map((it) => getPriceNumber(it.price))
      .filter((n): n is number => typeof n === "number");

    const lowest = prices.length ? Math.min(...prices) : null;
    const highest = prices.length ? Math.max(...prices) : null;
    const average = prices.length
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : null;

    const sortedPrices = [...prices].sort((a, b) => a - b);
    const median =
      sortedPrices.length === 0
        ? null
        : sortedPrices.length % 2 === 1
          ? sortedPrices[Math.floor(sortedPrices.length / 2)]
          : (sortedPrices[sortedPrices.length / 2 - 1] +
              sortedPrices[sortedPrices.length / 2]) /
            2;

    const currency =
      items.find((it) => it.price?.currency)?.price?.currency ?? "USD";

    return {
      count: items.length,
      lowest,
      median,
      average,
      highest,
      currency,
    };
  }, [items]);

  const gradeBreakdown = useMemo(() => {
    const buckets: Record<string, number[]> = {
      "PSA 10": [],
      "PSA 9": [],
      "PSA 8": [],
      Raw: [],
    };

    for (const item of items) {
      const price = getPriceNumber(item.price);
      if (price == null) continue;

      const grade = extractGrade(item.title);

      if (grade === 10) buckets["PSA 10"].push(price);
      else if (grade === 9) buckets["PSA 9"].push(price);
      else if (grade === 8) buckets["PSA 8"].push(price);
      else buckets.Raw.push(price);
    }

    function stats(arr: number[]) {
      if (!arr.length) return null;

      const sorted = [...arr].sort((a, b) => a - b);
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;

      const median =
        sorted.length % 2 === 1
          ? sorted[Math.floor(sorted.length / 2)]
          : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

      return {
        count: arr.length,
        avg,
        median,
        min: sorted[0],
        max: sorted[sorted.length - 1],
      };
    }

    return Object.entries(buckets).map(([grade, prices]) => ({
      grade,
      stats: stats(prices),
    }));
  }, [items]);

  const gradeAverages = useMemo(() => {
    return gradeBreakdown.reduce<Record<string, number>>((acc, entry) => {
      if (entry.stats) {
        acc[entry.grade] = entry.stats.avg;
      }
      return acc;
    }, {});
  }, [gradeBreakdown]);

  const bestDeals = useMemo(() => {
  return items
    .map((item) => {
      const price = getPriceNumber(item.price);
      const gradeLabel = getGradeLabel(item.title);
      const bucketAverage = gradeAverages[gradeLabel];

      if (
        price == null ||
        bucketAverage == null ||
        bucketAverage <= 0 ||
        price >= bucketAverage
      ) {
        return null;
      }

      const discountAmount = bucketAverage - price;
      const discountPct = Math.round((discountAmount / bucketAverage) * 100);

      if (discountPct < 5) return null;

      return {
        item,
        gradeLabel,
        price,
        bucketAverage,
        discountAmount,
        discountPct,
      };
    })
    .filter(
      (
        deal
      ): deal is {
        item: Item;
        gradeLabel: string;
        price: number;
        bucketAverage: number;
        discountAmount: number;
        discountPct: number;
      } => deal !== null
    )
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 5);
  }, [items, gradeAverages]);

  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">Grading – PSA</h1>
        <p className="muted">
          Enter a PSA certification number to pull card details and active eBay
          listings.
        </p>

        <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
          <input
            type="text"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Enter PSA cert number"
            className="input"
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Searching..." : "Search PSA Cert"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "10px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{result.title}</h2>

            <div style={{ display: "grid", gap: "8px" }}>
              <p>
                <strong>Cert Number:</strong> {result.cert_number}
              </p>
              <p>
                <strong>Subject:</strong> {result.subject}
              </p>
              <p>
                <strong>Year:</strong> {result.year}
              </p>
              <p>
                <strong>Brand:</strong> {result.brand}
              </p>
              <p>
                <strong>Card Number:</strong> {result.card_number}
              </p>
              <p>
                <strong>Grade:</strong> {result.grade}
              </p>
              <p>
                <strong>Category:</strong> {result.category}
              </p>
              <p>
                <strong>Variety:</strong> {result.variety || "—"}
              </p>
              <p>
                <strong>Total Population:</strong>{" "}
                {result.total_population ?? "—"}
              </p>
              <p>
                <strong>Higher Grades:</strong>{" "}
                {result.population_higher ?? "—"}
              </p>
              <p>
                <strong>Source:</strong> {result.source}
              </p>
            </div>
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Active eBay Listings</h2>
            <p style={{ marginTop: 0 }}>
              <strong>Search Query:</strong> {ebayQuery || "—"}
            </p>

            {listingLoading && <p>Loading active listings...</p>}

            {!listingLoading && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                  }}
                >
                  <span className="pill">Count: {snapshot.count}</span>
                  <span className="pill">
                    Lowest:{" "}
                    {snapshot.lowest == null
                      ? "—"
                      : formatCurrency(snapshot.lowest, snapshot.currency)}
                  </span>
                  <span className="pill">
                    Median:{" "}
                    {snapshot.median == null
                      ? "—"
                      : formatCurrency(snapshot.median, snapshot.currency)}
                  </span>
                  <span className="pill">
                    Average:{" "}
                    {snapshot.average == null
                      ? "—"
                      : formatCurrency(snapshot.average, snapshot.currency)}
                  </span>
                  <span className="pill">
                    Highest:{" "}
                    {snapshot.highest == null
                      ? "—"
                      : formatCurrency(snapshot.highest, snapshot.currency)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Price by Grade</h3>

                  <div style={{ display: "grid", gap: "10px" }}>
                    {gradeBreakdown.map(({ grade, stats }) => (
                      <div
                        key={grade}
                        style={{
                          padding: "10px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      >
                        <strong>{grade}</strong>

                        {stats ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              marginTop: "8px",
                            }}
                          >
                            <span className="pill">Count: {stats.count}</span>
                            <span className="pill">
                              Avg:{" "}
                              {formatCurrency(stats.avg, snapshot.currency)}
                            </span>
                            <span className="pill">
                              Median:{" "}
                              {formatCurrency(stats.median, snapshot.currency)}
                            </span>
                            <span className="pill">
                              Low:{" "}
                              {formatCurrency(stats.min, snapshot.currency)}
                            </span>
                            <span className="pill">
                              High:{" "}
                              {formatCurrency(stats.max, snapshot.currency)}
                            </span>
                          </div>
                        ) : (
                          <p className="muted small">No data</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {bestDeals.length > 0 && (
  <div
    style={{
      marginTop: "20px",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      background: "#fff",
    }}
  >
    <h3 style={{ marginTop: 0 }}>Best Deals</h3>

    <div style={{ display: "grid", gap: "12px" }}>
      {bestDeals.map(
        ({
          item,
          gradeLabel,
          discountPct,
          discountAmount,
          bucketAverage,
        }) => (
          <a
            key={item.itemId}
            href={item.itemWebUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              padding: "12px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              textDecoration: "none",
              color: "inherit",
              background: "#fff",
            }}
          >
            <p style={{ marginTop: 0, fontWeight: 700 }}>{item.title}</p>

            <div
              style={{
                display: "inline-block",
                marginBottom: "8px",
                padding: "6px 10px",
                borderRadius: "999px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                fontSize: "14px",
                fontWeight: 600,
                color: "#065f46",
              }}
            >
              🔥 {discountPct}% below {gradeLabel} avg
            </div>

            <p>
              <strong>Price:</strong> {formatMoney(item.price)}
            </p>
            <p>
              <strong>{gradeLabel} Avg:</strong>{" "}
              {formatCurrency(bucketAverage, snapshot.currency)}
            </p>
            <p>
              <strong>Under Avg By:</strong>{" "}
              {formatCurrency(discountAmount, snapshot.currency)}
            </p>
          </a>
        )
      )}
    </div>
  </div>
)}

                <div style={{ marginBottom: "12px", marginTop: "16px" }}>
                  <span className="muted small">
                    Showing {items.length} of {total} results
                  </span>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {items.map((it) => {
                    const price = getPriceNumber(it.price);
                    const gradeLabel = getGradeLabel(it.title);
                    const bucketAverage = gradeAverages[gradeLabel];

                    const showDealBadge =
                      price != null &&
                      bucketAverage != null &&
                      bucketAverage > 0 &&
                      price < bucketAverage;

                    const discountPct = showDealBadge
                      ? Math.round(
                          ((bucketAverage - price) / bucketAverage) * 100
                        )
                      : 0;

                    return (
                      <a
                        key={it.itemId}
                        href={it.itemWebUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 1fr",
                          gap: "12px",
                          padding: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                          textDecoration: "none",
                          color: "inherit",
                          background: "#fff",
                        }}
                      >
                        {it.image?.imageUrl ? (
                          <Image
                            src={it.image.imageUrl}
                            alt={it.title}
                            width={120}
                            height={120}
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "120px",
                              height: "120px",
                              background: "#f3f4f6",
                              borderRadius: "8px",
                            }}
                          />
                        )}

                        <div>
                          <p style={{ marginTop: 0, fontWeight: 700 }}>
                            {it.title}
                          </p>

                          {showDealBadge && discountPct >= 5 && price != null && (
                            <div
                              style={{
                                display: "inline-block",
                                marginBottom: "8px",
                                padding: "6px 10px",
                                borderRadius: "999px",
                                background: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#065f46",
                              }}
                            >
                              🔥 {discountPct}% below {gradeLabel} avg (
                              {formatCurrency(
                                bucketAverage - price,
                                snapshot.currency
                              )}{" "}
                              under)
                            </div>
                          )}

                          <p>
                            <strong>Price:</strong> {formatMoney(it.price)}
                          </p>

                          {it.itemEndDate && (
                            <p>
                              <strong>Ends:</strong>{" "}
                              {new Date(it.itemEndDate).toLocaleString()}
                            </p>
                          )}

                          {it.buyingOptions?.length ? (
                            <p>
                              <strong>Buying Options:</strong>{" "}
                              {it.buyingOptions.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </a>
                    );
                  })}
                </div>

                {!items.length && <p>No active listings found.</p>}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
