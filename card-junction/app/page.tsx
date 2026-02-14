import SearchClient from "./search/SearchClient";

export default function Page() {
  return (
    <main className="container">
      <h1 className="h1">Find PSA-graded baseball cards on Card Junction</h1>
      <p className="muted">
        MVP pulls live results from eBay and filters to graded items, PSA-only. Default sorting is Ending Soon.
      </p>
      <div style={{height: 10}} />
      <SearchClient />
      <div style={{height: 18}} />
      <div className="card">
        <div className="h2">Next expansions (after MVP)</div>
        <ul className="muted">
          <li>Add PSA cert verification + enrichment (PSA Public API).</li>
          <li>Add saved searches + alerts.</li>
          <li>Add checklist DB and match listings to checklist entries.</li>
        </ul>
      </div>
    </main>
  );
}
