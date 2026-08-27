import { NextResponse } from "next/server";
import { deleteHistoricalEntry, updateHistoricalEntry } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import type { EntryStatus } from "@/lib/types";
import {
  isEntryStatus,
  validateHistoricalPartialEntryInput,
} from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type HistoricalPatch = Partial<{
  redditUsername: string;
  whatsapp: string;
  note: string;
  status: EntryStatus;
  messagedAt: string;
}>;

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const patch: HistoricalPatch = validateHistoricalPartialEntryInput(body);
    if ("status" in body) {
      if (!isEntryStatus(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      patch.status = body.status;
    }

    const entry = await updateHistoricalEntry(id, patch);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid entry id." }, { status: 400 });
    }

    const deleted = await deleteHistoricalEntry(id);
    if (!deleted) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete historical entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry." },
      { status: 500 },
    );
  }
}
