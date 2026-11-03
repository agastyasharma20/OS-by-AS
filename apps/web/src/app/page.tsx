import { buttonVariants } from "@osbyas/ui/components/button";
import { BookOpen, Briefcase, Building2, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/shell/brand";
import { ThemeToggle } from "@/components/shell/theme-toggle";

const PILLARS = [
  { key: "institutional", icon: Building2 },
  { key: "academics", icon: BookOpen },
  { key: "exams", icon: ClipboardCheck },
  { key: "careers", icon: Briefcase },
] as const;

export default function LandingPage() {
  const t = useTranslations();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4 md:px-8">
        <BrandMark />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {t("landing.signInSoon")}
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-4 py-12 md:px-8">
        <section className="flex flex-col gap-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t("landing.eyebrow")}
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
            {t("app.tagline")}
          </h1>
          <p className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            {t("landing.description")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={buttonVariants({ variant: "primary" })}>
              {t("landing.openShell")}
            </Link>
          </div>
          <p className="text-sm text-muted-foreground sm:hidden">{t("landing.signInSoon")}</p>
        </section>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <Icon aria-hidden className="size-5 text-primary" />
              <span className="text-sm font-medium">{t(`landing.pillars.${key}`)}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
