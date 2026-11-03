import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SHOTS = "e2e/screenshots";

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
  ).toEqual([]);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((t) => window.localStorage.setItem("theme", t), theme);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(new RegExp(theme === "dark" ? "dark" : "light"));
}

for (const theme of ["light", "dark"] as const) {
  test(`landing page (${theme})`, async ({ page }, info) => {
    await page.goto("/");
    await setTheme(page, theme);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "One Operating System for the Entire Education Journey.",
    );
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);
    await page.screenshot({
      path: `${SHOTS}/${info.project.name}-landing-${theme}.png`,
      fullPage: true,
    });
  });

  test(`home (${theme})`, async ({ page }, info) => {
    await page.goto("/app");
    await setTheme(page, theme);
    await expect(
      page.getByRole("heading", { level: 1, name: "Welcome to OS by AS" }),
    ).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);
    await page.screenshot({
      path: `${SHOTS}/${info.project.name}-home-${theme}.png`,
      fullPage: true,
    });
  });

  test(`system status with live API (${theme})`, async ({ page }, info) => {
    await page.goto("/app/status");
    await setTheme(page, theme);
    await expect(page.getByTestId("overall-status")).toHaveText(/All systems operational/, {
      timeout: 15_000,
    });
    for (const check of ["database", "redis", "storage", "identity"]) {
      await expect(page.getByTestId(`check-${check}`)).toContainText("Operational");
    }
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);
    await page.screenshot({
      path: `${SHOTS}/${info.project.name}-status-${theme}.png`,
      fullPage: true,
    });
  });
}

test("navigation layout matches the viewport", async ({ page }, info) => {
  await page.goto("/app");
  const mobile = info.project.name.startsWith("mobile");
  await expect(page.getByTestId("sidebar")).toBeVisible({ visible: !mobile });
  await expect(page.getByTestId("bottom-nav")).toBeVisible({ visible: mobile });
});

test("command palette opens and navigates", async ({ page }, info) => {
  await page.goto("/app");
  await expect(page.locator("html")).toHaveAttribute("data-shell-ready", "true");
  if (info.project.name.startsWith("mobile")) {
    await page.getByTestId("bottom-nav").getByRole("button", { name: "Search" }).tap();
  } else {
    await page.keyboard.press("Control+k");
  }
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/${info.project.name}-palette-light.png` });
  await dialog.getByRole("combobox").fill("status");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/app\/status$/);
  await expect(dialog).toBeHidden();
});

test("theme toggle switches to dark mode and persists", async ({ page }) => {
  await page.goto("/app");
  await setTheme(page, "light");
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
