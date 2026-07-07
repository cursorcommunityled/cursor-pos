import { AppPageShell } from "@/components/AppPageShell";
import { AppTopBar } from "@/components/AppTopBar";
import { DocsBackLink } from "@/components/DocsBackLink";
import { DocsContent, DocsPageHeader } from "@/components/DocsContent";

export const metadata = {
  title: "Documentation | Cursor POS",
  description: "Printer setup and connection guide for Cursor POS.",
};

export default function DocsPage() {
  return (
    <AppPageShell>
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <AppTopBar />
        <DocsBackLink />
        <DocsPageHeader />
        <DocsContent />
      </div>
    </AppPageShell>
  );
}
