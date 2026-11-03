import { describe, expect, it } from "vitest";

import { resolveUpstream } from "./proxy";

const BASE = "http://api:8000";

describe("resolveUpstream", () => {
  it("forwards allowlisted paths to the fixed API origin", () => {
    expect(resolveUpstream(["health"], BASE)).toBe("http://api:8000/api/v1/health");
    expect(resolveUpstream(["health", "live"], BASE)).toBe("http://api:8000/api/v1/health/live");
  });

  it.each([
    [[]],
    [["docs"]],
    [["openapi.json"]],
    [["healthz"]],
    [["health", ".."]],
    [["health", "..", "admin"]],
    [["health", "../x"]],
    [["health/../x"]],
    [["health", "a/b"]],
    [["health", "."]],
    [["health", ""]],
    [["health", "x?y=1"]],
    [["health", "@evil.example"]],
    [["health", "%2e%2e"]],
    [["health", "\\..\\x"]],
    [Array(9).fill("health")],
  ])("rejects %j", (path) => {
    expect(resolveUpstream(path as string[], BASE)).toBeNull();
  });
});
