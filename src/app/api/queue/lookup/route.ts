import { NextResponse } from "next/server";
import { findCombinedEntriesByWhatsApp } from "@/lib/db";
import { normalizeWhatsAppWithCountry } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const whatsapp =
      body && typeof body === "object" && typeof (body as { whatsapp?: unknown }).whatsapp === "string"
        ? (body as { whatsapp: string }).whatsapp.trim()
        : "";

    const digits = normalizeWhatsAppWithCountry(whatsapp);
    if (!whatsapp || digits.length < 10 || digits.length > 15) {
      return NextResponse.json(
        { error: "Enter a valid WhatsApp number." },
        { status: 400 },
      );
    }

    const entries = await findCombinedEntriesByWhatsApp(digits);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to look up queue position:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
