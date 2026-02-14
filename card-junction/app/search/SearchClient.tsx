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

export default function SearchClient() {
  const [q, setQ] = useState("Ohtani rookie");
  const [mode, setMode] = useState<"all"|"auction"|"buynow">("all");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      {error ? <p style={{color: "#b91c1c"}}>{error}</p> : null}

      <div style={{marginTop: 14}} className="muted small">
        Showing {items.length} of {total} results
      </div>

      <div style={{marginTop: 12}} className="results">
        {items.map((it) => {
          const { psaGrade, psaCert } = extractPsaGradeAndCert(it.title);
          const ends = formatEnds(it.itemEndDate);
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
