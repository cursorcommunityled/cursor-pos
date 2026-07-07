import type { ReactNode } from "react";

export function AppPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4f4f5,transparent_55%),linear-gradient(180deg,#fafafa,#f4f4f5)] dark:bg-[radial-gradient(circle_at_top,#27272a,transparent_55%),linear-gradient(180deg,#18181b,#09090b)]">
      {children}
    </main>
  );
}
