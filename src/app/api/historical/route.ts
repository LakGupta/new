import { NextResponse } from "next/server";
import { createHistoricalEntry, listHistoricalEntries } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { rejectDuplicateSubmission } from "@/lib/duplicates";
import { validateHistoricalEntryInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await listHistoricalEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to list historical entries:", error);
    return NextResponse.json(
      { error: "Failed to load the historical queue." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const input = validateHistoricalEntryInput(body);

    // Same guard as the regular queue: one person, one place. Checks both
    // queues so a historical claim cannot duplicate a website entry.
    if (!(await isAdminRequest())) {
      const duplicate = await rejectDuplicateSubmission(input);
      if (duplicate) return duplicate;
    }

    const { entry, position } = await createHistoricalEntry(input);
    return NextResponse.json({ entry, position }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
