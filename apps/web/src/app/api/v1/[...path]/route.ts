/**
 * Backend-for-frontend proxy: the browser calls same-origin /api/v1/*, this forwards to the API.
 * Phase 1 forwards only read-only GETs to an allowlist of paths. Phase 3 adds session cookies,
 * CSRF protection and the remaining methods here.
 */
const ALLOWED_PREFIXES = ["health"];

function apiBaseUrl(): string {
  return process.env.API_INTERNAL_URL ?? "http://localhost:8000";
}

export async function GET(request: Request, ctx: RouteContext<"/api/v1/[...path]">) {
  const { path } = await ctx.params;
  if (
    !path.length ||
    !ALLOWED_PREFIXES.includes(path[0]) ||
    path.some((p) => p === ".." || p.includes("/"))
  ) {
    return Response.json({ detail: "Not found" }, { status: 404 });
  }
  const target = `${apiBaseUrl()}/api/v1/${path.map(encodeURIComponent).join("/")}`;
  try {
    const upstream = await fetch(target, {
      cache: "no-store",
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
