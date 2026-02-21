export default function GradingPage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">Grading Research</h1>
        <p className="muted">
          Compare grading standards, verify certifications, and analyze population reports.
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
          <div className="card">
            <h2>PSA</h2>
            <p className="muted">
              Cert lookup, population data, grading trends.
            </p>
          </div>

          <div className="card">
            <h2>BGS</h2>
            <p className="muted">
              Subgrades breakdown and Beckett registry tools.
            </p>
          </div>

          <div className="card">
            <h2>SGC</h2>
            <p className="muted">
              Cert verification and grading insights.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
