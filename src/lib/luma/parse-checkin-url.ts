export interface ParsedLumaCheckinUrl {
  eventId: string;
  pk: string;
  checkinUrl: string;
}

export function parseLumaCheckinUrl(raw: string): ParsedLumaCheckinUrl | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, "https://luma.com");
    const match = url.pathname.match(/\/check-in\/([^/]+)/i);
    const eventId = match?.[1];
    const pk = url.searchParams.get("pk");

    if (!eventId || !pk) {
      return null;
    }

    return {
      eventId,
      pk,
      checkinUrl: url.toString(),
    };
  } catch {
    return null;
  }
}
