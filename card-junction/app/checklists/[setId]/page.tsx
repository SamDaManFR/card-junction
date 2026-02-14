import checklist from "@/data/checklists.example.json";
import Link from "next/link";

export default async function SetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  const sets = (checklist as any).sets || [];
  const set = sets.find((s: any) => s.id === setId);

  if (!set) {
    return (
      <main className="container">
        <div className="card">
          <div className="h2">Set not found</div>
          <p className="muted">Edit data/checklists.example.json or add your own dataset.</p>
          <Link className="pill" href="/checklists">Back</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <div className="muted small">{set.year} • {set.brand}</div>
        <h1 className="h1">{set.name}</h1>

        <div style={{ marginTop: 12 }} className="card">
          <div className="muted small">Cards</div>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {(set.cards || []).map((c: any) => (
              <div key={`${c.cardNumber}-${c.player}`} className="card" style={{ borderStyle: "dashed" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700 }}>#{c.cardNumber} • {c.player}</div>
                  <div className="muted small">{c.team}</div>
                </div>
                <div className="muted small">{c.notes}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Link className="pill" href="/checklists">Back to checklists</Link>
        </div>
      </div>
    </main>
  );
}
