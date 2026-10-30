"use client";

import { useEffect, useState } from "react";
import { Listing, money } from "./ListingCard";

export default function MarketSnapshot({
  items,
  loading = false,
}: {
  items: Listing[];
  loading?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const groups = new Map<string, number[]>();
  for (const item of items) {
    const amount = item.price?.value.trim() ? Number(item.price.value) : NaN;
    if (!item.price?.currency || !Number.isFinite(amount) || amount < 0)
      continue;
    const prices = groups.get(item.price.currency) || [];
    prices.push(amount);
    groups.set(item.price.currency, prices);
  }
  const endingSoon =
    now === null
      ? null
      : items.filter((item) => {
          const remaining = Date.parse(item.itemEndDate || "") - now;
          return remaining > 0 && remaining <= 7200000;
        }).length;
  const stats = [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, values]) => {
      values.sort((a, b) => a - b);
      const mid = Math.floor(values.length / 2);
      return {
        currency,
        count: values.length,
        median:
          values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2,
        lowest: values[0],
        highest: values[values.length - 1],
        average: values.reduce((a, b) => a + b, 0) / values.length,
      };
    });
  function prices(key: "median" | "lowest" | "average" | "highest") {
    return loading || !stats.length
      ? "—"
      : stats.map((s) => (
          <span className="currency-value" key={s.currency}>
            {money(s[key], s.currency)} <small>{s.currency}</small>
          </span>
        ));
  }
  return (
    <section
      className="market-snapshot"
      aria-label="Active listing snapshot"
      aria-busy={loading}
    >
      <div className="snapshot-heading">
        <div>
          <p className="eyebrow">Market perspective</p>
          <h2>Active listing snapshot</h2>
        </div>
        <span className="snapshot-source">eBay · Loaded sample</span>
      </div>
      <p className="snapshot-description">
        Active eBay listing prices, not completed sales or appraised values.
        Based only on loaded listings matching your grade filter.
      </p>
      <dl className="metric-grid">
        <div className="metric metric-featured">
          <dt>Median listed price</dt>
          <dd>{prices("median")}</dd>
        </div>
        <div className="metric">
          <dt>Lowest listed price</dt>
          <dd>{prices("lowest")}</dd>
        </div>
        <div className="metric">
          <dt>Loaded listing count</dt>
          <dd>{loading ? "—" : items.length}</dd>
        </div>
        <div className="metric">
          <dt>Ending soon</dt>
          <dd>{loading || endingSoon === null ? "—" : endingSoon}</dd>
          <span className="metric-hint">Within the next 2 hours</span>
        </div>
      </dl>
      <dl className="secondary-metrics">
        <div>
          <dt>Average listed price</dt>
          <dd>{prices("average")}</dd>
        </div>
        <div>
          <dt>Highest listed price</dt>
          <dd>{prices("highest")}</dd>
        </div>
      </dl>
      <p className="snapshot-note">
        {loading
          ? "Updating the loaded sample…"
          : stats.length
            ? `Priced sample: ${stats.map((s) => `${s.count} ${s.currency}`).join(" · ")}. Currencies are calculated separately. Auction bids and asking prices may differ; cards may not be directly comparable.`
            : "Price metrics appear when priced listings are available. No sales-history data is included."}
      </p>
    </section>
  );
}
