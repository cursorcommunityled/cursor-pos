"use client";

import {
  Cable,
  Camera,
  Download,
  LoaderCircle,
  PlugZap,
  Printer,
  Save,
  Ticket,
  Unplug,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppTopBar } from "@/components/AppTopBar";
import { CameraCapture } from "@/components/CameraCapture";
import { DocsFooterLink } from "@/components/DocsBackLink";
import { PhotoReceiptPreview } from "@/components/PhotoReceiptPreview";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { useBrowserPrinter } from "@/hooks/useBrowserPrinter";
import { useLocale } from "@/lib/i18n/locale-context";
import { downloadReceiptBuffer } from "@/lib/browser-printer";
import { buildPhotoReceiptBuffer } from "@/lib/photo-receipt";
import { loadReceiptDefaults, saveReceiptDefaults } from "@/lib/receipt-defaults";
import { buildReceiptBuffer } from "@/lib/receipt";
import {
  type PaperWidth,
  defaultPhotoTicketData,
  defaultReceiptData,
  type PhotoTicketData,
  type ReceiptData,
  type TicketMode,
} from "@/lib/types";

type FieldKey = keyof ReceiptData;

export function PosApp() {
  const { t } = useLocale();
  const [mode, setMode] = useState<TicketMode>("event");
  const [receipt, setReceipt] = useState<ReceiptData>(defaultReceiptData);
  const [photoTicket, setPhotoTicket] = useState<PhotoTicketData>(defaultPhotoTicketData);
  const [status, setStatus] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    support,
    device,
    isConnected,
    isConnecting,
    baudRate,
    setBaudRate,
    connect,
    disconnect,
    print,
  } = useBrowserPrinter();

  const textFields = useMemo(
    () =>
      [
        { key: "businessName" as const, label: t.fields.businessName, placeholder: t.placeholders.businessName },
        { key: "nombre" as const, label: t.fields.nombre, placeholder: t.placeholders.nombre },
        { key: "extra" as const, label: t.fields.extra, placeholder: t.placeholders.extra },
        { key: "qrContent" as const, label: t.fields.qrContent, placeholder: t.placeholders.qrContent },
        { key: "eventType" as const, label: t.fields.eventType, placeholder: t.placeholders.eventType },
        { key: "actionLabel" as const, label: t.fields.actionLabel, placeholder: t.placeholders.actionLabel },
        { key: "wifiSsid" as const, label: t.fields.wifiSsid, placeholder: t.placeholders.wifiSsid },
        { key: "wifiPassword" as const, label: t.fields.wifiPassword, placeholder: t.placeholders.wifiPassword },
      ] satisfies Array<{ key: FieldKey; label: string; placeholder: string }>,
    [t],
  );

  useEffect(() => {
    const saved = loadReceiptDefaults();
    setReceipt(saved);
    setPhotoTicket((current) => ({
      ...current,
      nombre: saved.nombre,
      extra: saved.extra,
      paperWidth: saved.paperWidth,
    }));
  }, []);

  function updateField<K extends FieldKey>(key: K, value: ReceiptData[K]) {
    setReceipt((current) => ({ ...current, [key]: value }));

    if (key === "nombre" || key === "extra" || key === "paperWidth") {
      setPhotoTicket((current) => ({
        ...current,
        ...(key === "nombre" ? { nombre: value as string } : {}),
        ...(key === "extra" ? { extra: value as string } : {}),
        ...(key === "paperWidth" ? { paperWidth: value as PaperWidth } : {}),
      }));
    }
  }

  function updatePhotoField<K extends keyof PhotoTicketData>(key: K, value: PhotoTicketData[K]) {
    setPhotoTicket((current) => ({ ...current, [key]: value }));

    if (key === "nombre") {
      setReceipt((current) => ({ ...current, nombre: value as string }));
    }
    if (key === "extra") {
      setReceipt((current) => ({ ...current, extra: value as string }));
    }
    if (key === "paperWidth") {
      setReceipt((current) => ({ ...current, paperWidth: value as PaperWidth }));
    }
  }

  function handleSaveDefaults() {
    saveReceiptDefaults(receipt);
    setStatus(t.status.defaultsSaved);
  }

  async function handleConnect(transport: "serial" | "usb") {
    setStatus(null);

    try {
      await connect(transport);
      setStatus(
        transport === "serial" ? t.status.connectedSerial : t.status.connectedUsb,
      );
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : t.status.connectError;
      const message =
        rawMessage.includes("Failed to open") ||
        (error instanceof DOMException && error.name === "NetworkError")
          ? t.status.serialOpenFailed
          : rawMessage.includes("cancel") || rawMessage.includes("Cancel")
            ? t.status.connectCancelled
            : rawMessage;

      setStatus(message);
    }
  }

  async function handleDisconnect() {
    await disconnect();
    setStatus(t.status.disconnected);
  }

  async function handlePrint() {
    setIsPrinting(true);
    setStatus(null);

    try {
      const encoderOptions = {
        language: device?.language ?? "esc-pos",
        codepageMapping: device?.codepageMapping ?? "pos-5890",
      };

      const buffer =
        mode === "event"
          ? await buildReceiptBuffer(receipt, encoderOptions)
          : await buildPhotoReceiptBuffer(photoTicket, encoderOptions);

      await print(buffer);
      setStatus(mode === "event" ? t.status.printEvent : t.status.printPhoto);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.printError);
    } finally {
      setIsPrinting(false);
    }
  }

  async function handleDownload() {
    try {
      const encoderOptions = {
        language: device?.language ?? "esc-pos",
        codepageMapping: device?.codepageMapping ?? "pos-5890",
      };

      const buffer =
        mode === "event"
          ? await buildReceiptBuffer(receipt, encoderOptions)
          : await buildPhotoReceiptBuffer(photoTicket, encoderOptions);

      downloadReceiptBuffer(buffer);
      setStatus(t.status.downloaded);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.downloadError);
    }
  }

  const browserReady = support.secureContext && (support.serial || support.usb);
  const canPrintPhoto = mode !== "photo" || Boolean(photoTicket.photoDataUrl);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <AppTopBar />

      <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-sm font-medium text-zinc-700">{t.ticketMode.label}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("event")}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition ${
              mode === "event"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white"
            }`}
          >
            <Ticket className="h-5 w-5" />
            {t.ticketMode.event}
          </button>
          <button
            type="button"
            onClick={() => setMode("photo")}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition ${
              mode === "photo"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white"
            }`}
          >
            <Camera className="h-5 w-5" />
            {t.ticketMode.photo}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10 xl:flex-row xl:items-start">
      <section className="w-full shrink-0 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm xl:w-[520px]">
        <div className="mb-6">
          <p className="text-sm font-medium text-zinc-500">{t.app.brand}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            {t.app.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.app.subtitle}</p>
        </div>

        {!browserReady ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t.browser.unsupported}
          </div>
        ) : null}

        <div className="mb-6 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-800">{t.printer.title}</p>
              <p className="text-sm text-zinc-600">
                {isConnecting
                  ? t.printer.connecting
                  : isConnected && device
                    ? device.label
                    : t.printer.disconnected}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {isConnected ? t.printer.statusConnected : t.printer.statusDisconnected}
            </span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t.printer.baud}
            </span>
            <select
              value={baudRate}
              onChange={(event) => setBaudRate(Number(event.target.value))}
              disabled={isConnected}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:opacity-60"
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={115200}>115200</option>
            </select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleConnect("serial")}
              disabled={!support.serial || isConnecting || isConnected}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConnecting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Cable className="h-4 w-4" />
              )}
              {t.printer.connectSerial}
            </button>
            <button
              type="button"
              onClick={() => void handleConnect("usb")}
              disabled={
                !support.usb || support.isWindows || isConnecting || isConnected
              }
              title={support.isWindows ? t.printer.usbWindowsHint : undefined}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlugZap className="h-4 w-4" />
              {support.isWindows ? t.printer.usbUnavailable : t.printer.connectUsb}
            </button>
          </div>

          {isConnected ? (
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              <Unplug className="h-4 w-4" />
              {t.printer.disconnect}
            </button>
          ) : null}
        </div>

        {mode === "event" ? (
          <div className="space-y-4">
            {textFields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {field.label}
                </span>
                <input
                  type="text"
                  value={String(receipt[field.key])}
                  placeholder={field.placeholder}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  disabled={
                    field.key === "wifiSsid" || field.key === "wifiPassword"
                      ? !receipt.showWifi
                      : false
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">{t.fields.paperWidth}</span>
                <select
                  value={receipt.paperWidth}
                  onChange={(event) =>
                    updateField("paperWidth", Number(event.target.value) as PaperWidth)
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
                >
                  <option value={58}>58 mm</option>
                  <option value={80}>80 mm</option>
                </select>
              </label>

              <label className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={receipt.showWifi}
                  onChange={(event) => updateField("showWifi", event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <span className="text-sm font-medium text-zinc-700">{t.fields.includeWifi}</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">{t.fields.name}</span>
              <input
                type="text"
                value={photoTicket.nombre}
                placeholder={t.placeholders.nombre}
                onChange={(event) => updatePhotoField("nombre", event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">{t.fields.extra}</span>
              <input
                type="text"
                value={photoTicket.extra}
                placeholder={t.placeholders.extra}
                onChange={(event) => updatePhotoField("extra", event.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">{t.fields.paperWidth}</span>
              <select
                value={photoTicket.paperWidth}
                onChange={(event) =>
                  updatePhotoField("paperWidth", Number(event.target.value) as PaperWidth)
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white"
              >
                <option value={58}>58 mm</option>
                <option value={80}>80 mm</option>
              </select>
            </label>

            <CameraCapture
              photoSourceDataUrl={photoTicket.photoSourceDataUrl}
              photoFrameOffset={photoTicket.photoFrameOffset}
              photoDataUrl={photoTicket.photoDataUrl}
              onPhotoChange={(value) =>
                setPhotoTicket((current) => ({
                  ...current,
                  ...value,
                }))
              }
            />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void handlePrint()}
            disabled={isPrinting || !isConnected || !canPrintPhoto}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPrinting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {mode === "event" ? t.actions.printEvent : t.actions.printPhoto}
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={!canPrintPhoto}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {t.actions.download}
          </button>
        </div>

        {mode === "event" ? (
          <button
            type="button"
            onClick={handleSaveDefaults}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
          >
            <Save className="h-4 w-4" />
            {t.actions.saveDefaults}
          </button>
        ) : null}

        {status ? (
          <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">{status}</p>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-zinc-500">{t.printer.footnote}</p>
      </section>

      <aside className="flex min-w-0 flex-1 justify-center xl:sticky xl:top-10 xl:justify-center">
        {mode === "event" ? (
          <ReceiptPreview data={receipt} />
        ) : (
          <PhotoReceiptPreview data={photoTicket} />
        )}
      </aside>
      </div>

      <DocsFooterLink />
    </div>
  );
}
