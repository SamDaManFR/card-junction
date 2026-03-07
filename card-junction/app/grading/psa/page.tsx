"use client";

import { useState } from "react";

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
  message?: string;
};

export default function Page() {
  const [certNumber, setCertNumber] = useState("");
  const [result, setResult] = useState<PsaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const cert = certNumber.trim();

    if (!cert) {
      setError("Please enter a certification number.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/psa/${cert}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "PSA lookup failed.");
      }

      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">Grading – PSA</h1>
        <p className="muted">
          Enter a PSA certification number to pull card details.
        </p>

        <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
          <input
            type="text"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
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
              <p><strong>Cert Number:</strong> {result.cert_number}</p>
              <p><strong>Subject:</strong> {result.subject}</p>
              <p><strong>Year:</strong> {result.year}</p>
              <p><strong>Brand:</strong> {result.brand}</p>
              <p><strong>Card Number:</strong> {result.card_number}</p>
              <p><strong>Grade:</strong> {result.grade}</p>
              <p><strong>Category:</strong> {result.category}</p>
              <p><strong>Source:</strong> {result.source}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
