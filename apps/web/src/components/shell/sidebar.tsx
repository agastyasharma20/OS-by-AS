"use client";

import { cn } from "@osbyas/ui/cn";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { NAV_ITEMS, isActive } from "@/config/navigation";

import { BrandMark } from "./brand";
import { useShell } from "./shell-context";

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useShell();

  return (
    <aside
      data-testid="sidebar"
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface md:flex",
        collapsed ? "w-(--sidebar-collapsed-width)" : "w-(--sidebar-width)",
      )}
    >
      <div className="flex h-14 items-center px-4">
        <Link
          href="/app"
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <BrandMark showName={!collapsed} />
        </Link>
      </div>
      <nav aria-label={t("nav.main")} className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? t(item.labelKey) : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0" />
                  <span className={cn("truncate", collapsed && "sr-only")}>{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden className="size-4" />
          ) : (
            <PanelLeftClose aria-hidden className="size-4" />
          )}
          <span className={cn(collapsed && "sr-only")}>
            {collapsed ? t("nav.expand") : t("nav.collapse")}
          </span>
        </button>
      </div>
    </aside>
  );
}
