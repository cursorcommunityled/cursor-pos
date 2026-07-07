import type { LumaCalendarEvent, LumaGuestSummary, LumaGuestTicket } from "./types";

const LUMA_API_BASE = "https://public-api.luma.com";
const LUMA_LEGACY_API_BASE = "https://api.lu.ma/public/v1";

interface LumaPaginatedResponse<T> {
  entries: T[];
  has_more?: boolean;
  next_cursor?: string | null;
}

interface LumaCalendarEventEntry {
  id?: string;
  name?: string;
  start_at?: string | null;
}

interface LumaGuestApiResponse {
  id?: string;
  user_name?: string | null;
  user_first_name?: string | null;
  user_last_name?: string | null;
  user_email?: string;
  approval_status?: string;
  check_in_qr_code?: string;
  event_tickets?: Array<{
    id?: string;
    name?: string | null;
    checked_in_at?: string | null;
    event_ticket_type?: {
      name?: string | null;
    } | null;
  }>;
}

async function lumaFetch<T>(
  apiKey: string,
  path: string,
  init: RequestInit = {},
  baseUrl: string = LUMA_API_BASE,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-luma-api-key": apiKey,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      errorText.trim() || `Luma API error (${response.status} ${response.statusText})`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildGuestName(guest: LumaGuestApiResponse): string {
  const fullName = guest.user_name?.trim();
  if (fullName) {
    return fullName;
  }

  const composed = [guest.user_first_name, guest.user_last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  if (composed) {
    return composed;
  }

  return guest.user_email?.trim() || "Guest";
}

function normalizeTickets(guest: LumaGuestApiResponse): LumaGuestTicket[] {
  return (guest.event_tickets ?? []).map((ticket) => ({
    id: ticket.id ?? "",
    name: ticket.name ?? ticket.event_ticket_type?.name ?? null,
    checkedInAt: ticket.checked_in_at ?? null,
  }));
}

function pickTicketName(tickets: LumaGuestTicket[]): string | null {
  const namedTicket = tickets.find((ticket) => ticket.name?.trim());
  return namedTicket?.name?.trim() ?? null;
}

function isGuestCheckedIn(tickets: LumaGuestTicket[]): boolean {
  return tickets.some((ticket) => Boolean(ticket.checkedInAt));
}

export async function listCalendarEvents(apiKey: string): Promise<LumaCalendarEvent[]> {
  const events: LumaCalendarEvent[] = [];
  let cursor: string | null = null;

  do {
    const params = new URLSearchParams({
      sort_column: "start_at",
      sort_direction: "desc",
      pagination_limit: "100",
    });

    if (cursor) {
      params.set("pagination_cursor", cursor);
    }

    const response = await lumaFetch<LumaPaginatedResponse<LumaCalendarEventEntry>>(
      apiKey,
      `/v1/calendars/events/list?${params.toString()}`,
    );

    for (const entry of response.entries ?? []) {
      if (!entry.id || !entry.name) {
        continue;
      }

      events.push({
        id: entry.id,
        name: entry.name,
        startAt: entry.start_at ?? null,
      });
    }

    cursor = response.has_more ? response.next_cursor ?? null : null;
  } while (cursor);

  return events;
}

export async function getGuestByKey(
  apiKey: string,
  eventId: string,
  pk: string,
  eventName?: string,
  checkinUrl?: string,
): Promise<LumaGuestSummary> {
  const params = new URLSearchParams({
    event_id: eventId,
    id: pk,
  });

  const guest = await lumaFetch<LumaGuestApiResponse>(
    apiKey,
    `/v1/events/guests/get?${params.toString()}`,
  );

  const tickets = normalizeTickets(guest);
  const guestId = guest.id?.trim();
  if (!guestId) {
    throw new Error("Luma did not return a guest id.");
  }

  return {
    guestId,
    name: buildGuestName(guest),
    email: guest.user_email?.trim() ?? "",
    ticketName: pickTicketName(tickets),
    checkedIn: isGuestCheckedIn(tickets),
    eventId,
    eventName: eventName?.trim() || eventId,
    checkinUrl: checkinUrl ?? guest.check_in_qr_code ?? "",
    approvalStatus: guest.approval_status ?? "unknown",
  };
}

export async function checkInGuest(
  apiKey: string,
  eventId: string,
  guestIdentifier: string,
): Promise<void> {
  const attempts: Array<{ baseUrl: string; path: string; body: Record<string, string> }> = [
    {
      baseUrl: LUMA_API_BASE,
      path: "/v1/event/check-in-guest",
      body: { api_id: guestIdentifier, event_api_id: eventId },
    },
    {
      baseUrl: LUMA_API_BASE,
      path: "/v1/event/check-in-guest",
      body: { api_id: guestIdentifier },
    },
    {
      baseUrl: LUMA_LEGACY_API_BASE,
      path: "/event/check-in-guest",
      body: { api_id: guestIdentifier },
    },
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      await lumaFetch(
        apiKey,
        attempt.path,
        {
          method: "POST",
          body: JSON.stringify(attempt.body),
        },
        attempt.baseUrl,
      );
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Could not check in guest.");
    }
  }

  throw lastError ?? new Error("Could not check in guest.");
}
