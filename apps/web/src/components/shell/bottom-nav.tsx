"use client";

import { cn } from "@osbyas/ui/cn";
import { Bell, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

import { NAV_ITEMS, isActive } from "@/config/navigation";

import { ComingSoon } from "./coming-soon";
import { useShell } from "./shell-context";

const itemClass =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function BarButton({
  icon,
  label,
  ...props
}: ComponentProps<"button"> & { icon: ReactNode; label: string }) {
  return (
    <button type="button" className={cn(itemClass, "text-muted-foreground")} {...props}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function BottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const { setPaletteOpen } = useShell();

  return (
    <nav
      aria-label={t("nav.main")}
      data-testid="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(itemClass, active ? "text-primary" : "text-muted-foreground")}
          >
            <Icon aria-hidden className="size-5" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
      <BarButton
        icon={<Search aria-hidden className="size-5" />}
        label={t("nav.search")}
        onClick={() => setPaletteOpen(true)}
      />
      <ComingSoon
        title={t("comingSoon.notificationsTitle")}
        body={t("comingSoon.notificationsBody")}
        trigger={
          <BarButton
            icon={<Bell aria-hidden className="size-5" />}
            label={t("nav.notifications")}
          />
        }
      />
      <ComingSoon
        title={t("comingSoon.profileTitle")}
        body={t("comingSoon.profileBody")}
        trigger={
          <BarButton icon={<UserRound aria-hidden className="size-5" />} label={t("nav.profile")} />
        }
      />
    </nav>
  );
}
