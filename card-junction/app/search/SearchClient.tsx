"use client";

import { useMemo, useState } from "react";
import { extractPsaGradeAndCert } from "@/lib/parse";
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

function formatMoney(p?: { value: string; currency: string }) {
  if (!p) return "—";
  const v = Number(p.value);
  if (Number.isNaN(v)) return `${p.value} ${p.currency}`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency }).format(v);
}

function formatEnds(end?: string) {
  if (!end) return "";
  const d = new Date(end);
  const ms = d.getTime() - Date.now();
  if (Number.isNaN(ms)) return "";
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  const mins = Math.max(0, Math.floor((ms % 3_600_000) / 60_000));
  return `Ends in ${hours}h ${mins}m`;
}

function getPriceNumber(p?: { value: string; currency: string }) {
  if (!p) return null;
  const n = Number(p.value);
  return Number.isFinite(n) ? n : null;
}

function endsWithinHours(end?: string, hours = 2) {
  if (!end) return false;
  const ms = new Date(end).getTime() - Date.now();
  if (!Number.isFinite(ms)) return false;
  return ms > 0 && ms <= hours * 3_600_000;
}

export default function SearchClient() {
  const [q, setQ] = useState("Ohtani rookie");
  const [mode, setMode] = useState<"all"|"auction"|"buynow">("all");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState<"all" | "7" | "8" | "9" | "10">("all");

  async function runSearch() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/ebay/search?q=${encodeURIComponent(q)}&mode=${mode}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Search failed");
      const arr = (json.itemSummaries || []) as Item[];
// Default: sort by ending soon (items without end time go last).
arr.sort((a, b) => {
  const ta = a.itemEndDate ? new Date(a.itemEndDate).getTime() : Number.POSITIVE_INFINITY;
  const tb = b.itemEndDate ? new Date(b.itemEndDate).getTime() : Number.POSITIVE_INFINITY;
  return ta - tb;
});
setItems(arr);
      setTotal(json.total || 0);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const subtitle = useMemo(() => {
    const extra = mode === "auction" ? "Auctions only" : mode === "buynow" ? "Buy It Now only" : "Auctions + Buy It Now";
    return `${extra} • PSA-only • Graded only • Sorted: ending soon`;
  }, [mode]);
//  #addedhere
const filteredItems = useMemo(() => {
  if (grade === "all") return items;
  return items.filter((it) => {
    const { psaGrade } = extractPsaGradeAndCert(it.title);
    return psaGrade === grade;
  });
}, [items, grade]);

const snapshot = useMemo(() => {
const prices = filteredItems
  .map((it) => getPriceNumber(it.price))
  .filter((n): n is number => typeof n === "number");

  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;

  const endingSoonCount = filteredItems.filter((it) => endsWithinHours(it.itemEndDate, 2)).length;

  // Currency assumption: search results typically share one currency. We’ll use the first item’s currency if present.
  const currency = filteredItems.find((it) => it.price?.currency)?.price?.currency ?? "USD";

  return {
    count: filteredItems.length,
    lowest,
    highest,
    endingSoonCount,
    currency,
  };
}, [filteredItems]);
 //  #endedhere
     
const quickSearches = [
  { label: "Vintage: 1952 Topps Mantle", q: "1952 Topps Mantle" },
  { label: "Vintage: 1989 Upper Deck Griffey", q: "1989 Upper Deck Ken Griffey Jr #1" },
  { label: "Modern: Trout rookie", q: "Mike Trout rookie" },
  { label: "Modern: Ohtani Bowman", q: "Ohtani Bowman rookie" },
  { label: "Both: Topps Chrome", q: "Topps Chrome" },
];

  return (
    <div className="card">
      <div className="row">
  <div>
    <div className="muted small">Search</div>
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: 1952 Mantle, Trout rookie, Topps Chrome…" />
  </div>

  <div>
    <div className="muted small">Mode</div>
    <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
      <option value="all">All</option>
      <option value="auction">Auctions</option>
      <option value="buynow">Buy It Now</option>
    </select>
  </div>

  <div>
    <div className="muted small">Grade (PSA)</div>
    <select value={grade} onChange={(e) => setGrade(e.target.value as any)}>
      <option value="all">All grades</option>
      <option value="10">PSA 10</option>
      <option value="9">PSA 9</option>
      <option value="8">PSA 8</option>
      <option value="7">PSA 7</option>
    </select>
  </div>
</div>

      </div>

      <div style={{display:"flex", gap: 10, marginTop: 12, alignItems: "center"}}>
        <button onClick={runSearch} disabled={loading}>
          {loading ? "Searching…" : "Search eBay"}
        </button>
        <button className="secondary" onClick={() => { setQ(""); setItems([]); setTotal(0); }}>
          Clear
        </button>
        <div className="muted small">{subtitle}</div>
      </div>

<div style={{ marginTop: 12 }} className="card">
  <div className="muted small">Market Snapshot (active listings)</div>
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
    <span className="pill">Count: {snapshot.count}</span>
    <span className="pill">
      Lowest:{" "}
      {snapshot.lowest === null
        ? "—"
        : new Intl.NumberFormat(undefined, { style: "currency", currency: snapshot.currency }).format(snapshot.lowest)}
    </span>
    <span className="pill">
      Highest:{" "}
      {snapshot.highest === null
        ? "—"
        : new Intl.NumberFormat(undefined, { style: "currency", currency: snapshot.currency }).format(snapshot.highest)}
    </span>
    <span className="pill">Ending &lt; 2h: {snapshot.endingSoonCount}</span>
  </div>
</div>


      {error ? <p style={{color: "#b91c1c"}}>{error}</p> : null}

      <div style={{marginTop: 14}} className="muted small">
        Showing {filteredItems.length} of {total} results
      </div>

      <div style={{marginTop: 12}} className="results">
        {filteredItems.map((it) => {
          const { psaGrade, psaCert } = extractPsaGradeAndCert(it.title);
          const ends = formatEnds(it.itemEndDate);
  //    #addedcodehere
      function getPriceNumber(p?: { value: string; currency: string }) {
        if (!p) return null;
        const n = Number(p.value);
        return Number.isFinite(n) ? n : null;
        }

      function endsWithinHours(end?: string, hours = 2) {
        if (!end) return false;
        const ms = new Date(end).getTime() - Date.now();
        if (!Number.isFinite(ms)) return false;
        return ms > 0 && ms <= hours * 3_600_000;
        }
   //    #stoppedhere    
      return (
            <a key={it.itemId} className="card" href={`/items/${encodeURIComponent(it.itemId)}`} style={{textDecoration:"none"}}>
              {it.image?.imageUrl ? (
                <Image className="itemimg" src={it.image.imageUrl} alt={it.title} width={640} height={640} />
              ) : (
                <div className="itemimg" />
              )}
              <div style={{height: 10}} />
              <div style={{fontWeight: 700, lineHeight: 1.3}}>{it.title}</div>
              <div style={{display:"flex", gap: 8, flexWrap:"wrap", marginTop: 8}}>
                <span className="pill">{formatMoney(it.price)}</span>
                {psaGrade ? <span className="pill">PSA {psaGrade}</span> : <span className="pill">PSA (unknown)</span>}
                {psaCert ? <span className="pill">Cert {psaCert}</span> : null}
                {ends ? <span className="pill">{ends}</span> : null}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
