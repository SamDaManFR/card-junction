import checklist from "@/data/checklists.example.json";

export default function ChecklistsPage() {
  const sets = (checklist as any).sets || [];
  return (
    <main className="container">
      <h1 className="h1">Checklists (starter)</h1>
      <p className="muted">
        MVP includes an example JSON checklist file so you can start publishing your own structured checklists.
        Next step is moving this into Postgres and adding a real set browser.
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
