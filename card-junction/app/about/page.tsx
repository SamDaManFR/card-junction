export default function AboutPage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">About this MVP</h1>
        <p className="muted">
          This starter is built to launch quickly: PSA-only graded baseball cards, eBay-only listings,
          and a simple checklist publisher. From here we’ll add:
        </p>
        <ul className="muted">
          <li>PSA cert verification/enrichment via PSA Public API</li>
          <li>Saved searches, watchlists, and alerts</li>
          <li>Checklist database + listing-to-card matching</li>
          <li>More sources (auction houses/marketplaces) via partnerships/feeds</li>
        </ul>
      </div>
    </main>
  );
}
