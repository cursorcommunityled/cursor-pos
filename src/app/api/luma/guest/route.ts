import { NextResponse } from "next/server";

import { getGuestByKey } from "@/lib/luma/client";
import { isLumaAuthError, resolveLumaApiKey } from "@/lib/luma/server-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id")?.trim();
    const pk = searchParams.get("pk")?.trim();
    const eventName = searchParams.get("event_name")?.trim() ?? undefined;
    const checkinUrl = searchParams.get("checkin_url")?.trim() ?? undefined;

    if (!eventId || !pk) {
      return NextResponse.json(
        { error: "Missing event_id or pk query parameter." },
        { status: 400 },
      );
    }

    const apiKey = resolveLumaApiKey(request);
    const guest = await getGuestByKey(apiKey, eventId, pk, eventName, checkinUrl);
    return NextResponse.json({ guest });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load Luma guest.";

    const status = isLumaAuthError(error)
      ? 503
      : message.includes("404")
        ? 404
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
