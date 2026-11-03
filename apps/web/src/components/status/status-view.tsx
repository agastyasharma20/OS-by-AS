"use client";

import type { HealthResponse } from "@osbyas/api-client";
import { Badge } from "@osbyas/ui/components/badge";
import { Button } from "@osbyas/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@osbyas/ui/components/card";
import { EmptyState } from "@osbyas/ui/components/empty-state";
import { Skeleton } from "@osbyas/ui/components/skeleton";
import {
  CircleAlert,
  CircleCheck,
  CloudOff,
  Database,
  HardDrive,
  KeyRound,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";

const CHECKS = [
  { key: "database", icon: Database },
  { key: "redis", icon: Layers },
  { key: "storage", icon: HardDrive },
  { key: "identity", icon: KeyRound },
] as const;

type State = { kind: "loading" } | { kind: "error" } | { kind: "loaded"; data: HealthResponse };

export async function loadHealth(): Promise<State> {
  try {
    const { data, error, response } = await api.GET("/api/v1/health");
    if (data) return { kind: "loaded", data };
    // 503 still carries a typed HealthResponse body describing what is down.
    if (response.status === 503 && error && "checks" in error) {
      return { kind: "loaded", data: error as HealthResponse };
    }
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

export function StatusView() {
  const t = useTranslations("status");
  const [state, setState] = useState<State>({ kind: "loading" });

  const refresh = useCallback(async () => {
    setState({ kind: "loading" });
    setState(await loadHealth());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadHealth().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={state.kind === "loading"}>
          <RefreshCw
            aria-hidden
            className={state.kind === "loading" ? "animate-spin" : undefined}
          />
          {t("refresh")}
        </Button>
      </div>

      {state.kind === "error" ? (
        <EmptyState
          icon={<CloudOff />}
          title={t("errorTitle")}
          description={t("errorBody")}
          action={<Button onClick={refresh}>{t("retry")}</Button>}
        />
      ) : (
        <>
          <div role="status" aria-live="polite" data-testid="overall-status">
            {state.kind === "loading" ? (
              <Skeleton className="h-14 w-full" />
            ) : state.data.status === "ok" ? (
              <div className="flex items-center gap-3 rounded-lg bg-success-soft p-4 font-medium text-success">
                <CircleCheck aria-hidden className="size-5" /> {t("overallOk")}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-danger-soft p-4 font-medium text-danger">
                <CircleAlert aria-hidden className="size-5" /> {t("overallDegraded")}
              </div>
            )}
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHECKS.map(({ key, icon: Icon }) => {
              const check = state.kind === "loaded" ? state.data.checks[key] : undefined;
              return (
                <li key={key}>
                  <Card data-testid={`check-${key}`}>
                    <CardHeader className="flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon aria-hidden className="size-4 text-muted-foreground" />
                        {t(`checks.${key}`)}
                      </CardTitle>
                      {state.kind === "loading" ? (
                        <Skeleton className="h-5 w-20" />
                      ) : check?.status === "ok" ? (
                        <Badge tone="success">{t("state.ok")}</Badge>
                      ) : (
                        <Badge tone="danger">{t("state.down")}</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {state.kind === "loading" ? (
                        <Skeleton className="h-4 w-24" />
                      ) : check ? (
                        <span>
                          {t("latency", { ms: Math.round(check.latency_ms) })}
                          {check.error ? ` · ${t(`reason.${check.error}`)}` : null}
                        </span>
                      ) : (
                        <span>{t("reason.unavailable")}</span>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
