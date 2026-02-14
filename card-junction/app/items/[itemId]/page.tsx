import Image from "next/image";
import { extractPsaGradeAndCert } from "@/lib/parse";
import { ebayGetItem } from "@/lib/ebay";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;

  // Call eBay directly from the server (avoid fetch("/api/...") on the server)
  const item = await ebayGetItem(itemId);

  const title: string = item?.title ?? "Item";
  const img: string | undefined = item?.image?.imageUrl;
  const price = item?.price ? `${item.price.value} ${item.price.currency}` : "—";
  const url: string | undefined = item?.itemWebUrl;
  const end: string | undefined = item?.itemEndDate;
  const ends = end ? new Date(end).toLocaleString() : undefined;

  const { psaGrade, psaCert } = extractPsaGradeAndCert(title);

  return (
    <main className="container">
      <div className="card">
        <div className="muted small">eBay Item</div>
        <h1 className="h1">{title}</h1>

        <div className="row" style={{ marginTop: 12 }}>
          <div>
            {img ? (
              <Image className="itemimg" src={img} alt={title} width={900} height={900} />
            ) : (
              <div className="itemimg" />
            )}
          </div>

          <div>
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
              <div className="card">
                <div className="muted small">Current</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{price}</div>
              </div>

              <div className="card">
                <div className="muted small">Grade</div>
                <div style={{ fontWeight: 700 }}>PSA {psaGrade ?? "—"}</div>
                <div className="muted small">Cert: {psaCert ?? "—"}</div>
              </div>

              <div className="card">
                <div className="muted small">Ends</div>
                <div style={{ fontWeight: 700 }}>{ends ?? "—"}</div>
              </div>

              <div className="card">
                <div className="muted small">Actions</div>
                {url ? (
                  <a className="pill" href={url} target="_blank" rel="noreferrer">
                    Open on eBay
                  </a>
                ) : (
                  <span className="muted small">No URL found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <details style={{ marginTop: 14 }}>
          <summary className="muted small">Raw response (debug)</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(item, null, 2)}</pre>
        </details>
      </div>
    </main>
  );
}
