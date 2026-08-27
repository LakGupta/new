import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const ok = await isAdminRequest();
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
