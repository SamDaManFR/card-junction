export default function LocalShowsPage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">Find Local Card Shows</h1>
        <p className="muted">
          Search by ZIP code to find upcoming card shows near you.
        </p>

        <div style={{ marginTop: 20 }}>
          <input placeholder="Enter ZIP code..." />
          <button style={{ marginLeft: 10 }}>Search</button>
        </div>

        <div style={{ marginTop: 20 }} className="card">
          <p className="muted">Show results will appear here.</p>
        </div>
      </div>
    </main>
  );
}
