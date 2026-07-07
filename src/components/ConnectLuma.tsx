"use client";

import { KeyRound, ShieldAlert, Unplug } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/lib/i18n/locale-context";
import {
  clearSessionLumaApiKey,
  hasSessionLumaApiKey,
  saveSessionLumaApiKey,
} from "@/lib/luma/storage";

interface ConnectLumaProps {
  onConnected: () => void;
  onDisconnected?: () => void;
  showConnectedState?: boolean;
}

export function ConnectLuma({
  onConnected,
  onDisconnected,
  showConnectedState = false,
}: ConnectLumaProps) {
  const { t } = useLocale();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(
    () => showConnectedState && hasSessionLumaApiKey(),
  );

  async function handleConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      setError(t.luma.connectKeyRequired);
      return;
    }

    setIsConnecting(true);
    setError(null);

    saveSessionLumaApiKey(trimmedKey);

    try {
      const response = await fetch("/api/luma/events", {
        headers: {
          "x-luma-api-key": trimmedKey,
        },
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        clearSessionLumaApiKey();
        throw new Error(payload.error ?? t.luma.connectFailed);
      }

      setApiKeyInput("");
      setIsConnected(true);
      onConnected();
    } catch (connectError) {
      setError(
        connectError instanceof Error ? connectError.message : t.luma.connectFailed,
      );
    } finally {
      setIsConnecting(false);
    }
  }

  function handleDisconnect() {
    clearSessionLumaApiKey();
    setIsConnected(false);
    setApiKeyInput("");
    setError(null);
    onDisconnected?.();
  }

  if (isConnected) {
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {t.luma.connectConnectedTitle}
            </p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
              {t.luma.connectConnectedHint}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
          >
            <Unplug className="h-4 w-4" />
            {t.luma.connectDisconnect}
          </button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {t.luma.connectSecurityTitle}
          </div>
          <p>{t.luma.connectSecurityBody}</p>
          <p className="mt-2">{t.luma.connectSecurityDeployHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {t.luma.connectTitle}
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t.luma.connectSubtitle}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <div className="mb-1 flex items-center gap-2 font-medium">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t.luma.connectSecurityTitle}
        </div>
        <p>{t.luma.connectSecurityBody}</p>
        <p className="mt-2">{t.luma.connectSecurityDeployHint}</p>
      </div>

      <form onSubmit={(event) => void handleConnect(event)} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.luma.connectKeyLabel}
          </span>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(event) => setApiKeyInput(event.target.value)}
            placeholder={t.luma.connectKeyPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
          />
        </label>

        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {t.luma.connectStorageHint}
        </p>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isConnecting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          {isConnecting ? t.luma.connectSaving : t.luma.connectAction}
        </button>
      </form>
    </div>
  );
}
