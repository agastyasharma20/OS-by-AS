import { resolveUpstream } from "@/lib/proxy";

/**
 * Backend-for-frontend proxy: the browser calls same-origin /api/v1/*, this forwards to the API.
 * Phase 1 forwards only read-only GETs to an allowlist of paths, with no query string and no
 * client headers. Phase 3 adds session cookies, CSRF protection and the remaining methods here.
 */
function apiBaseUrl(): string {
  return process.env.API_INTERNAL_URL ?? "http://localhost:8000";
}

export async function GET(_request: Request, ctx: RouteContext<"/api/v1/[...path]">) {
  const { path } = await ctx.params;
  const target = resolveUpstream(path, apiBaseUrl());
  if (!target) {
    return Response.json({ detail: "Not found" }, { status: 404 });
  }
  try {
    const upstream = await fetch(target, {
      cache: "no-store",
      redirect: "manual",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json({ detail: "API unavailable" }, { status: 502 });
  }
}
