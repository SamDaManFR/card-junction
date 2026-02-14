import { NextResponse } from "next/server";
import { ebaySearch } from "@/lib/ebay";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const mode = searchParams.get("mode") || "all"; // all | auction | buynow
    const offset = Number(searchParams.get("offset") || "0");

    if (!q.trim()) {
      return NextResponse.json({ itemSummaries: [], total: 0 });
    }

    const buyingOptions =
      mode === "auction" ? ["AUCTION"] :
      mode === "buynow" ? ["FIXED_PRICE"] :
      undefined;

    // Force PSA in query for MVP (PSA-only). Keep it server-side too.
    const resp = await ebaySearch({
      q: `${q} PSA`,
      limit: 24,
      offset,
      buyingOptions: buyingOptions as any,
    });

    return NextResponse.json(resp);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
