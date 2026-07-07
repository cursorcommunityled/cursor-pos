import { NextResponse } from "next/server";

import { checkInGuest } from "@/lib/luma/client";
import { isLumaAuthError, resolveLumaApiKey } from "@/lib/luma/server-auth";

export const runtime = "nodejs";

interface CheckinRequestBody {
  eventId?: string;
  guestId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckinRequestBody;
    const eventId = body.eventId?.trim();
    const guestId = body.guestId?.trim();

    if (!eventId || !guestId) {
      return NextResponse.json(
        { error: "Missing eventId or guestId." },
        { status: 400 },
      );
    }

    const apiKey = resolveLumaApiKey(request);
    await checkInGuest(apiKey, eventId, guestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not check in guest.";

    const status = isLumaAuthError(error) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
