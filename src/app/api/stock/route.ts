import { NextResponse } from "next/server";
import { getStock, saveStock } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { MAX_STOCK_QUANTITY } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stock = await getStock();
    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Failed to load stock:", error);
    return NextResponse.json(
      { error: "Failed to load the stock count." },
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
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const { remaining } = body as { remaining?: unknown };

    // null is a real value here: it clears the count back to "not counted yet",
    // which has to stay distinct from zero.
    if (remaining !== null) {
      if (typeof remaining !== "number" || !Number.isInteger(remaining)) {
        return NextResponse.json(
          { error: "Enter a whole number of straps." },
          { status: 400 },
        );
      }
      if (remaining < 0) {
        return NextResponse.json(
          { error: "The count can't be negative." },
          { status: 400 },
        );
      }
      if (remaining > MAX_STOCK_QUANTITY) {
        return NextResponse.json(
          { error: `That looks too high. Keep it under ${MAX_STOCK_QUANTITY.toLocaleString()}.` },
          { status: 400 },
        );
      }
    }

    const stock = await saveStock(remaining as number | null);
    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Failed to save stock:", error);
    return NextResponse.json(
      { error: "Couldn't save the stock count — try again." },
      { status: 500 },
    );
  }
}
