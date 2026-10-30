import checklist from "@/data/checklists.example.json";

export default function ChecklistsPage() {
  const sets = (checklist as any).sets || [];
  return (
    <main className="container">
      <h1 className="h1">Card checklists</h1>
      <p className="muted">
        Explore sample checklists organized by year, brand, and set. These examples are not complete set catalogs.
      </p>

      <div className="grid" style={{marginTop: 14}}>
        {sets.map((s: any) => (
          <div key={s.id} className="card">
            <div className="muted small">{s.year} • {s.brand}</div>
            <div style={{fontWeight: 800}}>{s.name}</div>
            <div className="muted small" style={{marginTop: 8}}>{(s.cards || []).length} cards (example)</div>
            <a className="pill" style={{marginTop: 10}} href={`/checklists/${s.id}`}>Open set</a>
          </div>
        ))}
      </div>
    </main>
  );
}
