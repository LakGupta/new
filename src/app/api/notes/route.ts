import { NextResponse } from "next/server";
import { getAdminNotes, saveAdminNotes } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { MAX_ADMIN_NOTES_LENGTH } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notes = await getAdminNotes();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Failed to load admin notes:", error);
    return NextResponse.json(
      { error: "Failed to load your notes." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const content = body?.content;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Notes must be sent as text." },
        { status: 400 },
      );
    }
    if (content.length > MAX_ADMIN_NOTES_LENGTH) {
      return NextResponse.json(
        {
          error: `Your notes are too long. Keep them under ${MAX_ADMIN_NOTES_LENGTH.toLocaleString()} characters.`,
        },
        { status: 400 },
      );
    }

    const notes = await saveAdminNotes(content);
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Failed to save admin notes:", error);
    return NextResponse.json(
      { error: "Couldn't save your notes. We'll keep what you typed — try again." },
      { status: 500 },
    );
  }
}
