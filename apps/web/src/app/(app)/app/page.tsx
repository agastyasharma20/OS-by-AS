import { buttonVariants } from "@osbyas/ui/components/button";
import { EmptyState } from "@osbyas/ui/components/empty-state";
import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <EmptyState
        icon={<LayoutGrid />}
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/app/status" className={buttonVariants({ variant: "outline" })}>
            {t("viewStatus")}
          </Link>
        }
      />
    </div>
  );
}
