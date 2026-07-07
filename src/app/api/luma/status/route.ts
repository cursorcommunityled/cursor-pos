import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    serverConfigured: Boolean(process.env.LUMA_API_KEY?.trim()),
  });
}
