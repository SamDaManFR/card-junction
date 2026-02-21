export default function LivestreamPage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">Livestream Card Shows</h1>
        <p className="muted">
          Discover live card breaks, auctions, and marketplace streams.
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
          <div className="card">
            <h2>Whatnot</h2>
            <p className="muted">
              Browse live card auctions and breaks.
            </p>
          </div>

          <div className="card">
            <h2>eBay Live</h2>
            <p className="muted">
              Explore live seller events and featured streams.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
