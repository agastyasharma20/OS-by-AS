import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../../test/render";
import { AppShell } from "./app-shell";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/app/status",
  useRouter: () => ({ push }),
}));

describe("AppShell", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
  });

  it("renders sidebar and bottom navigation with every nav item", () => {
    renderWithProviders(<AppShell>content</AppShell>);
    const sidebar = screen.getByTestId("sidebar");
    expect(within(sidebar).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/app");
    expect(within(sidebar).getByRole("link", { name: "System status" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const bottom = screen.getByTestId("bottom-nav");
    expect(within(bottom).getAllByRole("link")).toHaveLength(2);
    expect(within(bottom).getAllByRole("button")).toHaveLength(3);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("shows the current page in the breadcrumb", () => {
    renderWithProviders(<AppShell>x</AppShell>);
    const crumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumb).getByText("System status")).toHaveAttribute("aria-current", "page");
  });

  it("opens the command palette with Ctrl+K and navigates on select", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppShell>x</AppShell>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByRole("combobox"), "home");
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/app");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppShell>x</AppShell>);
    await user.keyboard("{Meta>}k{/Meta}");
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByRole("combobox"), "zzzz-nothing");
    expect(within(dialog).getByText("No results found.")).toBeInTheDocument();
  });

  it("collapses the sidebar and remembers it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppShell>x</AppShell>);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-collapsed", "true");
    expect(window.localStorage.getItem("osbyas.sidebar.collapsed")).toBe("1");
  });

  it("explains placeholder controls instead of doing nothing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppShell>x</AppShell>);
    const bottom = screen.getByTestId("bottom-nav");
    await user.click(within(bottom).getByRole("button", { name: "Alerts" }));
    expect(await screen.findByText(/notification engine arrives in Phase 6/)).toBeInTheDocument();
  });

  it("toggles dark mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppShell>x</AppShell>);
    await act(async () => {
      await user.click(screen.getByTestId("theme-toggle"));
    });
    expect(document.documentElement).toHaveClass("dark");
  });
});
