"use client";

import { useMemo, useRef, useState } from "react";
import { extractPsaGradeAndCert } from "@/lib/parse";
import ListingCard, { Listing } from "@/components/ListingCard";
import MarketSnapshot from "@/components/MarketSnapshot";

type Item = Listing;

export default function SearchClient() {
  const [q, setQ] = useState("Ohtani rookie");
  const [mode, setMode] = useState<"all" | "auction" | "buynow">("all");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState<"all" | "7" | "8" | "9" | "10">("all");

  const [searched, setSearched] = useState(false);
  const requestVersion = useRef(0);

  async function runSearch() {
    const version = ++requestVersion.current;
    setSearched(true);
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ebay/search?q=${encodeURIComponent(q)}&mode=${mode}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Search failed");
      if (version !== requestVersion.current) return;
      const arr = (json.itemSummaries || []) as Item[];
      // Default: sort by ending soon (items without end time go last).
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
      setTotal(json.total || 0);
    } catch (e: any) {
      if (version === requestVersion.current) {
        setError(e?.message || "Search failed");
        setItems([]);
        setTotal(0);
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }

  const subtitle = useMemo(() => {
    const extra =
      mode === "auction"
        ? "Auctions only"
        : mode === "buynow"
          ? "Buy It Now only"
          : "Auctions + Buy It Now";
    return `${extra} • PSA-only • Graded only • Sorted: ending soon`;
  }, [mode]);
  const filteredItems = useMemo(() => {
    if (grade === "all") return items;
    return items.filter((it) => {
      const { psaGrade } = extractPsaGradeAndCert(it.title);
      return psaGrade === grade;
    });
  }, [items, grade]);

  const quickSearches = [
    { label: "Vintage: 1952 Topps Mantle", q: "1952 Topps Mantle" },
    {
      label: "Vintage: 1989 Upper Deck Griffey",
      q: "1989 Upper Deck Ken Griffey Jr #1",
    },
    { label: "Modern: Trout rookie", q: "Mike Trout rookie" },
    { label: "Modern: Ohtani Bowman", q: "Ohtani Bowman rookie" },
    { label: "Both: Topps Chrome", q: "Topps Chrome" },
  ];

  return (
    <>
      <section className="card search-panel" aria-labelledby="search-title">
        <h2 id="search-title" className="search-panel-title">
          Search the marketplace
        </h2>
        <div className="quick-searches">
          <div className="muted small">Start with a player or set</div>
          <div className="quick-search-buttons">
            {quickSearches.map((s) => (
              <button
                key={s.label}
                className="secondary"
                onClick={() => {
                  setQ(s.q);
                }}
                type="button"
                style={{ padding: "8px 10px" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="row search-fields">
          <div>
            <label htmlFor="card-search">Player, card, or set</label>
            <input
              id="card-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try: 1952 Mantle, Trout rookie, Topps Chrome…"
            />
          </div>

          <div>
            <label htmlFor="buying-mode">Buying format</label>
            <select
              id="buying-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="auction">Auctions</option>
              <option value="buynow">Buy It Now</option>
            </select>
          </div>

          <div>
            <label htmlFor="psa-grade">PSA grade</label>
            <select
              id="psa-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value as any)}
            >
              <option value="all">All grades</option>
              <option value="10">PSA 10</option>
              <option value="9">PSA 9</option>
              <option value="8">PSA 8</option>
              <option value="7">PSA 7</option>
            </select>
          </div>
        </div>

        <div className="search-actions">
          <button
            className="search-submit"
            onClick={runSearch}
            disabled={loading}
          >
            {loading ? "Searching…" : "Search eBay"}
          </button>
          <button
            className="secondary"
            onClick={() => {
              ++requestVersion.current;
              setLoading(false);
              setError("");
              setSearched(false);
              setQ("");
              setItems([]);
              setTotal(0);
            }}
          >
            Clear
          </button>
          <div className="muted small">{subtitle}</div>
        </div>
      </section>

      <MarketSnapshot
        items={loading || error ? [] : filteredItems}
        loading={loading}
      />
      <section
        className="results-section"
        aria-labelledby="results-title"
        aria-busy={loading}
      >
        <div className="results-heading">
          <div>
            <p className="eyebrow">The marketplace</p>
            <h2 id="results-title">
              {searched ? "Search results" : "Your next find starts here"}
            </h2>
          </div>
          <p className="muted small" role="status">
            {loading
              ? "Searching active eBay listings…"
              : searched && !error
                ? `${filteredItems.length} displayed · ${items.length} loaded · ${total.toLocaleString()} matches on eBay`
                : "PSA-graded baseball cards"}
          </p>
        </div>
        {loading ? (
          <>
            <p className="sr-only" role="status">
              Loading listings. Please wait.
            </p>
            <div className="results listing-results" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="listing-skeleton" key={index}>
                  <div className="skeleton-image" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="results-state error-state" role="alert">
            <span className="state-symbol" aria-hidden="true">
              !
            </span>
            <h3>We couldn’t load the listings</h3>
            <p>
              Your search and filters are still here. Try again in a moment.
            </p>
            <details>
              <summary>Error details</summary>
              <p>{error}</p>
            </details>
            <button onClick={runSearch}>Try again</button>
          </div>
        ) : !searched ? (
          <div className="results-state">
            <span className="state-symbol" aria-hidden="true">
              ⌕
            </span>
            <h3>Search by player, card, or set</h3>
            <p>
              Choose a quick search or enter your own, then select Search eBay
              to explore active listings and their price snapshot.
            </p>
          </div>
        ) : !filteredItems.length ? (
          <div className="results-state">
            <span className="state-symbol" aria-hidden="true">
              ⌕
            </span>
            <h3>
              {items.length
                ? "No loaded listings match this grade"
                : "No listings found"}
            </h3>
            <p>
              {items.length
                ? "Try All grades to see the rest of your loaded sample."
                : "Try a broader player name or set, or switch the buying format."}
            </p>
            {grade !== "all" && (
              <button className="secondary" onClick={() => setGrade("all")}>
                Show all grades
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="results-note">
              Sorted by ending soon within the loaded sample. Grade filtering
              applies to this sample, not all eBay matches.
            </p>
            <div className="results listing-results">
              {filteredItems.map((item) => (
                <ListingCard key={item.itemId} item={item} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
