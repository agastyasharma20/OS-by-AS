"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { BottomNav } from "./bottom-nav";
import { CommandPalette } from "./command-palette";
import { ShellProvider } from "./shell-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  return (
    <ShellProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        {t("skipToContent")}
      </a>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
      <CommandPalette />
    </ShellProvider>
  );
}
