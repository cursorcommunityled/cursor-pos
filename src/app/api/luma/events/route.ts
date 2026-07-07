import { NextResponse } from "next/server";

import { listCalendarEvents } from "@/lib/luma/client";
import { isLumaAuthError, resolveLumaApiKey } from "@/lib/luma/server-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const apiKey = resolveLumaApiKey(request);
    const events = await listCalendarEvents(apiKey);
    return NextResponse.json({ events });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load Luma events.";

    const status = isLumaAuthError(error) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
