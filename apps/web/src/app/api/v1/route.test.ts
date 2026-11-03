import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./[...path]/route";

function ctx(path: string[]) {
  return { params: Promise.resolve({ path }) } as Parameters<typeof GET>[1];
}

describe("BFF proxy route", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("forwards only an accept header to the configured API and never the client's headers", async () => {
    vi.stubEnv("API_INTERNAL_URL", "http://api:8000");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response('{"status":"ok"}', { status: 200 }));
    const request = new Request("http://web/api/v1/health?x=1", {
      headers: { cookie: "session=secret", authorization: "Bearer t", host: "evil.example" },
    });
    const response = await GET(request, ctx(["health"]));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api:8000/api/v1/health");
    expect(init?.headers).toEqual({ accept: "application/json" });
    expect(init?.redirect).toBe("manual");
  });

  it("returns 404 without calling upstream for disallowed paths", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const response = await GET(new Request("http://web/api/v1/docs"), ctx(["docs"]));
    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a generic 502 when the API is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("connect ECONNREFUSED 10.0.0.5:8000"),
    );
    const response = await GET(new Request("http://web/api/v1/health"), ctx(["health"]));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("10.0.0.5");
  });
});
