import {
  normalizeRedditUsername,
  normalizeWhatsAppWithCountry,
} from "@/lib/validation";

// Mirrors validateEntryInput in src/lib/validation.ts so people see problems
// under the field before submitting. The server still validates everything.

export function redditUsernameError(value: string): string | null {
  const username = normalizeRedditUsername(value);
  if (!username) return "Enter your Reddit username.";
  if (username.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Only letters, numbers, underscores and hyphens (max 50).";
  }
  return null;
}

export function whatsappError(value: string): string | null {
  if (!value.trim()) return "Enter your WhatsApp number.";
  const digits = normalizeWhatsAppWithCountry(value.trim());
  if (digits.length < 10 || digits.length > 15) {
    return "Enter a valid WhatsApp number, e.g. 98765 43210.";
  }
  return null;
}
