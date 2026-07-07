"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearStoredPrinter,
  getBrowserPrinterSupport,
  loadStoredPrinter,
  saveStoredPrinter,
  type BrowserPrinterSupport,
  type PrinterTransport,
  type StoredPrinterDevice,
} from "@/lib/browser-printer";
import { BrowserReceiptPrinter } from "@/lib/web-printer-driver";

interface UseBrowserPrinterResult {
  support: BrowserPrinterSupport;
  device: StoredPrinterDevice | null;
  isConnected: boolean;
  isConnecting: boolean;
  baudRate: number;
  setBaudRate: (value: number) => void;
  connect: (transport: PrinterTransport) => Promise<void>;
  disconnect: () => Promise<void>;
  print: (data: Uint8Array) => Promise<void>;
}

export function useBrowserPrinter(): UseBrowserPrinterResult {
  const [support] = useState<BrowserPrinterSupport>(() => getBrowserPrinterSupport());
  const [device, setDevice] = useState<StoredPrinterDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);

  const printerRef = useRef<BrowserReceiptPrinter | null>(null);

  const bindPrinter = useCallback((printer: BrowserReceiptPrinter) => {
    printer.addEventListener("connected", (info) => {
      if (printerRef.current !== printer) {
        return;
      }

      saveStoredPrinter(info);
      setDevice(info);
      setIsConnected(true);
      setIsConnecting(false);
    });

    printer.addEventListener("disconnected", () => {
      if (printerRef.current !== printer) {
        return;
      }

      setIsConnected(false);
      setDevice(null);
      printerRef.current = null;
    });
  }, []);

  const connect = useCallback(
    async (transport: PrinterTransport) => {
      if (transport === "usb" && support.isWindows) {
        throw new Error(
          "En Windows, USB directo no funciona porque el driver bloquea la impresora. Usa Conectar Serial.",
        );
      }

      setIsConnecting(true);
      let printer: BrowserReceiptPrinter | null = null;

      try {
        if (printerRef.current) {
          await printerRef.current.disconnect();
        }

        printer = new BrowserReceiptPrinter();
        printerRef.current = printer;
        bindPrinter(printer);

        if (transport === "serial") {
          await printer.connectSerial({ baudRate });
          return;
        }

        await printer.connectUsb();
      } catch (error) {
        setIsConnecting(false);

        if (printer && printerRef.current === printer) {
          await printer.disconnect().catch(() => undefined);
          printerRef.current = null;
        }

        if (error instanceof DOMException && error.name === "NotFoundError") {
          throw new Error(
            transport === "serial"
              ? "No apareció ningún puerto serial. Habilita el puerto COM virtual en el driver de la impresora."
              : "No apareció ninguna impresora USB compatible.",
          );
        }

        throw error;
      }
    },
    [baudRate, bindPrinter, support.isWindows],
  );

  const disconnect = useCallback(async () => {
    if (printerRef.current) {
      await printerRef.current.disconnect();
    }

    clearStoredPrinter();
    setDevice(null);
    setIsConnected(false);
    printerRef.current = null;
  }, []);

  const print = useCallback(async (data: Uint8Array) => {
    if (!printerRef.current) {
      throw new Error("Conecta una impresora antes de imprimir.");
    }

    await printerRef.current.print(data);
  }, []);

  useEffect(() => {
    const stored = loadStoredPrinter();

    if (stored?.baudRate) {
      setBaudRate(stored.baudRate);
    }
  }, []);

  return {
    support,
    device,
    isConnected,
    isConnecting,
    baudRate,
    setBaudRate,
    connect,
    disconnect,
    print,
  };
}
