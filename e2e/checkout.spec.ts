import { test, expect } from "@playwright/test";

// Regression guard for the critical path: browse -> add to cart -> checkout
// -> OTP verify -> order confirmation. Runs against the local fallback
// catalog/order store (no Supabase needed) using the dev-mode OTP code the
// checkout API returns outside production.

test("full guest checkout with Cash on Delivery", async ({ page }) => {
  await page.goto("/product/amber-signet-ring", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByRole("button", { name: /added/i })).toBeVisible();

  await page.goto("/checkout", { waitUntil: "networkidle" });

  await page.getByLabel("Full name").fill("Ayesha Khan");
  await page.getByLabel("Mobile number").fill("03001234567");
  await page.getByLabel("Province").selectOption("Punjab");
  await page.getByLabel("Street address").fill("House 12, Street 5");
  await page.getByLabel("City").fill("Lahore");
  await page.getByLabel("Postal code").fill("54000");

  await expect(page.getByText(/Delivers to Lahore/i)).toBeVisible();

  await page.getByRole("button", { name: /send verification code/i }).click();
  await expect(page.getByText(/dev mode/i)).toBeVisible();
  const devCodeText = await page.getByText(/verification code:/i).innerText();
  const code = devCodeText.match(/(\d{6})/)?.[1];
  expect(code).toBeTruthy();

  await page.getByPlaceholder("6-digit code").fill(code!);
  await page.getByRole("button", { name: /^verify$/i }).click();
  await expect(page.getByText(/phone number verified/i)).toBeVisible();

  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page).toHaveURL(/\/order-confirmation\/1720-/);
  await expect(page.getByText(/order confirmed/i)).toBeVisible();
});
