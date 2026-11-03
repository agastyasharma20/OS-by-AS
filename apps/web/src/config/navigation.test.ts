import { describe, expect, it } from "vitest";

import { NAV_ITEMS, findNavItem, isActive } from "./navigation";

describe("navigation", () => {
  it("marks home active only on /app exactly", () => {
    expect(isActive("/app", "/app")).toBe(true);
    expect(isActive("/app/status", "/app")).toBe(false);
  });

  it("marks nested routes active for their section", () => {
    expect(isActive("/app/status", "/app/status")).toBe(true);
    expect(isActive("/app/status/history", "/app/status")).toBe(true);
    expect(isActive("/app/statusx", "/app/status")).toBe(false);
  });

  it("finds the most specific item for breadcrumbs", () => {
    expect(findNavItem("/app/status")?.id).toBe("status");
    expect(findNavItem("/app")?.id).toBe("home");
  });

  it("uses unique ids and i18n label keys", () => {
    expect(new Set(NAV_ITEMS.map((i) => i.id)).size).toBe(NAV_ITEMS.length);
    expect(NAV_ITEMS.every((i) => i.labelKey.startsWith("nav."))).toBe(true);
  });
});
