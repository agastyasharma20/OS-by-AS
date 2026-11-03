import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/render";
import { StatusView } from "./status-view";

const okBody = {
  status: "ok",
  checks: {
    database: { status: "ok", latency_ms: 3.2, error: null },
    redis: { status: "ok", latency_ms: 1.1, error: null },
    storage: { status: "ok", latency_ms: 8.9, error: null },
    identity: { status: "ok", latency_ms: 20.4, error: null },
  },
};

function respond(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
    );
}

describe("StatusView", () => {
  it("shows a loading state, then all checks operational", async () => {
    respond(okBody);
    renderWithProviders(<StatusView />);
    expect(screen.getByRole("button", { name: /Refresh/ })).toBeDisabled();
    expect(await screen.findByText("All systems operational")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("check-identity")).getByText("Operational"),
    ).toBeInTheDocument();
    expect(within(screen.getByTestId("check-storage")).getByText("9 ms")).toBeInTheDocument();
  });

  it("shows degraded state from a 503 response with the failing check", async () => {
    respond(
      {
        status: "degraded",
        checks: { ...okBody.checks, redis: { status: "down", latency_ms: 2000, error: "timeout" } },
      },
      503,
    );
    renderWithProviders(<StatusView />);
    expect(await screen.findByText("Some services are unavailable")).toBeInTheDocument();
    const redis = screen.getByTestId("check-redis");
    expect(within(redis).getByText("Down")).toBeInTheDocument();
    expect(within(redis).getByText(/Timed out/)).toBeInTheDocument();
  });

  it("shows an error state when the API is unreachable and recovers on retry", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("network"));
    renderWithProviders(<StatusView />);
    expect(await screen.findByText("Couldn't reach the API")).toBeInTheDocument();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(okBody), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("All systems operational")).toBeInTheDocument();
  });

  it("treats an unexpected error status as an error, not as healthy", async () => {
    respond({ detail: "API unavailable" }, 502);
    renderWithProviders(<StatusView />);
    expect(await screen.findByText("Couldn't reach the API")).toBeInTheDocument();
  });
});
