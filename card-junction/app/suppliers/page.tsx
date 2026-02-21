export default function SuppliersPage() {
  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">Suppliers & Releases</h1>
        <p className="muted">
          Monitor new product releases and set alerts.
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
          <div className="card">
            <h2>Topps</h2>
            <p className="muted">
              Track upcoming baseball and special releases.
            </p>
          </div>

          <div className="card">
            <h2>Panini</h2>
            <p className="muted">
              Monitor basketball, football, and hobby drops.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
