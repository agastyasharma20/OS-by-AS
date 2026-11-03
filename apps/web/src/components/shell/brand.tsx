import { useTranslations } from "next-intl";

export function BrandMark({ showName = true }: { showName?: boolean }) {
  const t = useTranslations("app");
  return (
    <span className="flex items-center gap-2 font-semibold">
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
      >
        OS
      </span>
      {showName ? (
        <span className="truncate">{t("name")}</span>
      ) : (
        <span className="sr-only">{t("name")}</span>
      )}
    </span>
  );
}
