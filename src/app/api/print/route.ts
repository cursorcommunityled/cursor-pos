import { NextResponse } from "next/server";

import { buildReceiptBuffer } from "@/lib/receipt";
import type { ReceiptData } from "@/lib/types";
import { printRawBuffer } from "@/lib/windows-printer";

export const runtime = "nodejs";

interface PrintRequestBody {
  receipt: ReceiptData;
  printerName?: string;
  downloadOnly?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PrintRequestBody;

    if (!body.receipt?.businessName || !body.receipt?.qrContent) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del ticket." },
        { status: 400 },
      );
    }

    const buffer = buildReceiptBuffer(body.receipt);

    if (body.downloadOnly) {
      return new NextResponse(Buffer.from(buffer), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="ticket.bin"',
        },
      });
    }

    if (!body.printerName) {
      return NextResponse.json(
        { error: "Selecciona una impresora para imprimir." },
        { status: 400 },
      );
    }

    await printRawBuffer(body.printerName, buffer);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo imprimir el ticket.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
