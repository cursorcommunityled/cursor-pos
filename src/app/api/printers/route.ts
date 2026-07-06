import { NextResponse } from "next/server";

import { listPrinters } from "@/lib/windows-printer";

export const runtime = "nodejs";

export async function GET() {
  try {
    const printers = await listPrinters();
    return NextResponse.json({ printers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron listar las impresoras.";

    return NextResponse.json({ printers: [], error: message }, { status: 500 });
  }
}
