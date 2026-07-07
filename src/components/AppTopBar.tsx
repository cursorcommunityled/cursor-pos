"use client";

import Image from "next/image";
import Link from "next/link";

import { LanguageSwitch } from "@/components/LanguageSwitch";
import { LOGO_SRC } from "@/lib/logo-image";
import { useLocale } from "@/lib/i18n/locale-context";

const CREATOR_URL = "https://linktr.ee/cbiux";

export function AppTopBar() {
  const { t } = useLocale();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <LanguageSwitch />
      <Link
        href={CREATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2.5 self-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 sm:self-auto"
      >
        <Image
          src={LOGO_SRC}
          alt="Cursor logo"
          width={22}
          height={25}
          className="shrink-0 opacity-90"
        />
        <span>
          {t.creator.by} <span className="font-medium text-zinc-900">cbiux</span>
        </span>
      </Link>
    </div>
  );
}
