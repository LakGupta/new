import { NextResponse } from "next/server";
import { createEntry, listEntries } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { rejectDuplicateSubmission } from "@/lib/duplicates";
import { validateEntryInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await listEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to list entries:", error);
    return NextResponse.json(
      { error: "Failed to load the queue." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const input = validateEntryInput(body);

    // Public submissions cannot join twice with the same number/username.
    // Admins keep the ability to add intentional repeats from the admin page.
    if (!(await isAdminRequest())) {
      const duplicate = await rejectDuplicateSubmission(input);
      if (duplicate) return duplicate;
    }

    const { entry, position } = await createEntry(input);
    return NextResponse.json({ entry, position }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
