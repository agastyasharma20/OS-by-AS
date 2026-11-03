"use client";

import { Button } from "@osbyas/ui/components/button";
import { Bell, ChevronRight, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { findNavItem } from "@/config/navigation";

import { BrandMark } from "./brand";
import { ComingSoon } from "./coming-soon";
import { useShell } from "./shell-context";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { setPaletteOpen } = useShell();
  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur">
      <Link href="/app" className="md:hidden">
        <BrandMark showName={false} />
      </Link>
      <nav aria-label={t("nav.breadcrumb")} className="min-w-0 flex-1">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li className="hidden sm:block">
            <Link href="/app" className="hover:text-foreground">
              {t("app.name")}
            </Link>
          </li>
          {current ? (
            <>
              <li aria-hidden className="hidden sm:block">
                <ChevronRight className="size-4" />
              </li>
              <li aria-current="page" className="truncate font-medium text-foreground">
                {t(current.labelKey)}
              </li>
            </>
          ) : null}
        </ol>
      </nav>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPaletteOpen(true)}
        className="hidden w-56 justify-start text-muted-foreground md:inline-flex"
        data-testid="search-trigger"
      >
        <Search aria-hidden />
        <span className="flex-1 text-left">{t("nav.search")}</span>
        <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">
          {t("palette.shortcut")}
        </kbd>
      </Button>
      <ThemeToggle />
      <div className="hidden items-center gap-1 md:flex">
        <ComingSoon
          title={t("comingSoon.notificationsTitle")}
          body={t("comingSoon.notificationsBody")}
          trigger={
            <Button variant="ghost" size="icon" aria-label={t("nav.notifications")}>
              <Bell aria-hidden />
            </Button>
          }
        />
        <ComingSoon
          title={t("comingSoon.profileTitle")}
          body={t("comingSoon.profileBody")}
          trigger={
            <Button variant="ghost" size="icon" aria-label={t("nav.profile")}>
              <UserRound aria-hidden />
            </Button>
          }
        />
      </div>
    </header>
  );
}
