"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useLocale } from "@/lib/i18n/locale-context";

export function DocsBackLink() {
  const { t } = useLocale();

  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {t.docs.backToApp}
    </Link>
  );
}

export function DocsFooterLink() {
  const { t } = useLocale();

  return (
    <div className="mt-12 flex justify-center border-t border-zinc-200 pt-8">
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
      >
        {t.docs.openLink}
      </Link>
    </div>
  );
}
