import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "helios_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function hmac(value: string): string {
  const secret = process.env.ADMIN_PASSWORD || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${hmac(String(expiresAt))}`;
}

export function verifySessionToken(token: string): boolean {
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expected = hmac(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return token ? verifySessionToken(token) : false;
}
