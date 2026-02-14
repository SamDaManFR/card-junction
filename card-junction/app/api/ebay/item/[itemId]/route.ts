import { NextResponse } from "next/server";
import { ebayGetItem } from "@/lib/ebay";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId: itemIdParam } = await params;
    const itemId = decodeURIComponent(itemIdParam);

    const data = await ebayGetItem(itemId);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
