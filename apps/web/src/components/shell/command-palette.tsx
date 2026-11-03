"use client";

import { Command } from "cmdk";
import { SunMoon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { NAV_ITEMS } from "@/config/navigation";

import { useShell } from "./shell-context";

const itemClass =
  "flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground";

export function CommandPalette() {
  const t = useTranslations();
  const router = useRouter();
  const { paletteOpen, setPaletteOpen } = useShell();
  const { resolvedTheme, setTheme } = useTheme();

  function run(action: () => void) {
    setPaletteOpen(false);
    action();
  }

  return (
    <Command.Dialog
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      label={t("palette.title")}
      overlayClassName="fixed inset-0 z-50 bg-black/40"
      contentClassName="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface text-surface-foreground shadow-2xl"
    >
      <Command.Input
        placeholder={t("palette.placeholder")}
        aria-label={t("palette.placeholder")}
        className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
          {t("palette.empty")}
        </Command.Empty>
        <Command.Group
          heading={t("palette.groupNavigation")}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Command.Item
                key={item.id}
                value={t(item.labelKey)}
                onSelect={() => run(() => router.push(item.href))}
                className={itemClass}
              >
                <Icon aria-hidden className="size-4" />
                {t(item.labelKey)}
              </Command.Item>
            );
          })}
        </Command.Group>
        <Command.Group
          heading={t("palette.groupActions")}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <Command.Item
            value={t("palette.toggleTheme")}
            onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
            className={itemClass}
          >
            <SunMoon aria-hidden className="size-4" />
            {t("palette.toggleTheme")}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
