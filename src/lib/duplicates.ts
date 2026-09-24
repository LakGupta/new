import { NextResponse } from "next/server";
import { findDuplicateEntries } from "./db";
import type { DuplicateMatchField } from "./types";

function duplicateMessage(fields: Set<DuplicateMatchField>): string {
  if (fields.has("whatsapp") && fields.has("redditUsername")) {
    return "That WhatsApp number and Reddit username are already in the queue.";
  }
  if (fields.has("whatsapp")) {
    return "That WhatsApp number is already in the queue.";
  }
  return "That Reddit username is already in the queue.";
}

/**
 * Rejects a public submission that matches an existing queue entry (same
 * WhatsApp number or Reddit username). Returns a ready-to-send 409 response
 * carrying the matching entries so the form can show the person where they
 * already stand, or `null` when the submission is clear.
 *
 * Admins can still add entries that intentionally repeat a number/username;
 * callers skip this check for authenticated admin requests.
 */
export async function rejectDuplicateSubmission(input: {
  redditUsername: string;
  whatsapp: string;
}): Promise<NextResponse | null> {
  const duplicates = await findDuplicateEntries(input);
  if (duplicates.length === 0) return null;

  const fields = new Set<DuplicateMatchField>();
  for (const duplicate of duplicates) {
    for (const field of duplicate.matchedOn) fields.add(field);
  }

  return NextResponse.json(
    { error: duplicateMessage(fields), duplicates },
    { status: 409 },
  );
}
