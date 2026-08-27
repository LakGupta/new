import { STATUSES, type EntryStatus } from "./types";

export interface EntryInput {
  redditUsername: string;
  whatsapp: string;
  note: string;
}

export function normalizeWhatsApp(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function normalizeWhatsAppWithCountry(value: string): string {
  let digits = normalizeWhatsApp(value);

  // Remove a leading Indian trunk prefix (0).
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Already has India's +91 country code.
  if (digits.startsWith("91") && digits.length === 12) {
    return digits;
  }

  // A plain 10-digit Indian mobile number -> add +91 automatically.
  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

export function normalizeRedditUsername(value: string): string {
  // Accept "u/name" or "/u/name" and store just "name".
  return value.trim().replace(/^\/?u\//i, "").trim();
}

export function validateEntryInput(input: unknown): EntryInput {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid submission.");
  }

  const raw = input as Record<string, unknown>;

  const redditUsername = normalizeRedditUsername(
    typeof raw.redditUsername === "string" ? raw.redditUsername : "",
  );
  const whatsapp = typeof raw.whatsapp === "string" ? raw.whatsapp.trim() : "";
  const note = typeof raw.note === "string" ? raw.note.trim() : "";

  if (!redditUsername) {
    throw new Error("Reddit username is required.");
  }
  if (redditUsername.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(redditUsername)) {
    throw new Error(
      "Reddit username can only contain letters, numbers, underscores and hyphens (max 50 characters).",
    );
  }

  const digits = normalizeWhatsAppWithCountry(whatsapp);
  if (!whatsapp) {
    throw new Error("WhatsApp number is required.");
  }
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Enter a valid WhatsApp number.");
  }

  if (note.length > 500) {
    throw new Error("Note must be 500 characters or fewer.");
  }

  return {
    redditUsername,
    whatsapp: digits,
    note,
  };
}

export function validatePartialEntryInput(
  input: unknown,
): Partial<EntryInput> {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid data.");
  }

  const raw = input as Record<string, unknown>;
  const patch: Partial<EntryInput> = {};

  if (raw.redditUsername !== undefined) {
    const value = normalizeRedditUsername(
      typeof raw.redditUsername === "string" ? raw.redditUsername : "",
    );
    if (!value || value.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error(
        "Reddit username can only contain letters, numbers, underscores and hyphens (max 50 characters).",
      );
    }
    patch.redditUsername = value;
  }

  if (raw.whatsapp !== undefined) {
    const value = typeof raw.whatsapp === "string" ? raw.whatsapp.trim() : "";
    const digits = normalizeWhatsAppWithCountry(value);
    if (!value || digits.length < 10 || digits.length > 15) {
      throw new Error("Enter a valid WhatsApp number.");
    }
    patch.whatsapp = digits;
  }

  if (raw.note !== undefined) {
    const value = typeof raw.note === "string" ? raw.note.trim() : "";
    if (value.length > 500) {
      throw new Error("Note must be 500 characters or fewer.");
    }
    patch.note = value;
  }

  return patch;
}

export function isEntryStatus(value: unknown): value is EntryStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function whatsAppLink(number: string, text?: string): string {
  const base = `https://wa.me/${normalizeWhatsApp(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
