import { expect, test } from "@playwright/test";

/**
 * Covers only what needs a real browser: the shell rendering, the login/register
 * mode switch and the signed-out route guard. None of it calls the API, so the
 * suite runs against the frontend alone.
 */

test.describe("auth page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens in sign-in mode", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText(/Sign in/);
  });

  test("switches to register and labels the submit as the create action", async ({ page }) => {
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByRole("heading", { name: "Create your free account" })
    ).toBeVisible();

    // The submit button used to keep saying "Sign in" in register mode.
    await expect(page.locator('button[type="submit"]')).toHaveText(/Create account/);

    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Phone number")).toBeVisible();
  });

  test("carries a typed email across the mode switch", async ({ page }) => {
    await page.getByLabel("Email").fill("rizq@example.com");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByLabel("Email")).toHaveValue("rizq@example.com");
  });

  test("blocks an empty submit with client-side validation", async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
  });

  test("fits the desktop viewport without horizontal overflow", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );

    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("authenticated route guard", () => {
  test("sends a signed-out visitor from /dashboard back to the auth page", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });
});

test.describe("email verification screen", () => {
  /**
   * The narrowest viewport the layout is expected to hold. The primary button is
   * `w-full max-w-[512px]`, so a fixed width creeping in anywhere on this screen
   * would show up here as a horizontal scrollbar.
   */
  test("fits a 320px viewport without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });

    // Without a valid `email` param the view redirects straight back to `/`.
    await page.goto("/check-email?email=rizq@example.com");

    await expect(page.getByRole("heading", { name: "Check your email!" })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );

    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("gives the resend control a visible keyboard focus ring", async ({ page }) => {
    await page.goto("/check-email?email=rizq@example.com");

    /**
     * Tabbing in rather than calling `.focus()` matters: `:focus-visible` only
     * resolves for keyboard-initiated focus, so a programmatic focus would leave
     * this assertion at the mercy of browser heuristics.
     */
    await page.getByRole("button", { name: "Open email inbox" }).focus();
    await page.keyboard.press("Tab");

    const resend = page.getByRole("button", { name: "Resend email" });
    await expect(resend).toBeFocused();

    // Tailwind's ring utility paints the focus state through box-shadow.
    const shadow = await resend.evaluate((node) => getComputedStyle(node).boxShadow);

    expect(shadow).not.toBe("none");
  });
});
