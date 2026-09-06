import { NextResponse } from "next/server";
import { listCombinedEntries } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await listCombinedEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to list combined queue:", error);
    return NextResponse.json(
      { error: "Failed to load the queue." },
      { status: 500 },
    );
  }
}
