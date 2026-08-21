import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PRINTER_NAME = /^[\w .()\-]{1,200}$/;
const POWERSHELL = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";

function isWindows(): boolean {
  return process.platform === "win32";
}

export async function listPrinters(): Promise<string[]> {
  if (!isWindows()) {
    return [];
  }

  const { stdout } = await execFileAsync(POWERSHELL, [
    "-NoProfile",
    "-Command",
    "Get-Printer | Select-Object -ExpandProperty Name | ConvertTo-Json -Compress",
  ]);

  const trimmed = stdout.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed) as string | string[];
  return Array.isArray(parsed) ? parsed : [parsed];
}

export async function printRawBuffer(
  printerName: string,
  data: Uint8Array,
): Promise<void> {
  if (!isWindows()) {
    throw new Error("La impresión directa solo está disponible en Windows.");
  }

  if (!PRINTER_NAME.test(printerName)) {
    throw new Error("Invalid printer name.");
  }

  const tempFile = join(tmpdir(), `cursor-pos-${randomBytes(8).toString("hex")}.bin`);
  const scriptPath = join(process.cwd(), "scripts", "print-raw.ps1");

  await writeFile(tempFile, data);

  try {
    await execFileAsync(POWERSHELL, [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-PrinterName",
      printerName,
      "-FilePath",
      tempFile,
    ]);
  } finally {
    await unlink(tempFile).catch(() => undefined);
  }
}
