import { NextResponse } from "next/server";

// You can wire this to Vercel Cron to prove scheduling works.
export async function GET() {
  return NextResponse.json({ ok: true, now: new Date().toISOString() });
}
