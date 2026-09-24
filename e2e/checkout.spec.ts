import { test, expect, type Page } from "@playwright/test";

// Critical path against the built-in catalogue (no Supabase needed): choose a
// piece -> cart drawer -> checkout -> order placed -> WhatsApp confirmation.
// With no SMS gateway configured, checkout has no phone-verification step.

async function fillAddress(page: Page) {
  await page.getByLabel("Full name").fill("Ayesha Khan");
  await page.getByLabel("Mobile number").fill("03001234567");
  await page.getByLabel("Province").selectOption("Punjab");
  await page.getByLabel("Street address").fill("House 12, Street 5");
  await page.getByLabel("City").fill("Lahore");
  await expect(page.getByText(/Delivers to Lahore/i)).toBeVisible();
}

test("colour choice carries through to the order and the WhatsApp confirmation", async ({ page }) => {
  await page.goto("/product/mermaid-tear");
  await page.getByRole("button", { name: /Clear crystal/ }).click();
  await expect(page.getByText("Colour: Clear crystal")).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();

  const drawer = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Clear crystal")).toBeVisible();
  await drawer.getByRole("link", { name: "Checkout" }).click();

  await expect(page.getByText(/verify your phone/i)).toHaveCount(0);
  await fillAddress(page);
  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page).toHaveURL(/\/order-confirmation\/1720-/);
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();

  const confirm = page.getByRole("link", { name: /confirm on whatsapp/i });
  const href = (await confirm.getAttribute("href"))!;
  expect(href).toMatch(/^https:\/\/wa\.me\/923356389333\?text=/);
  const text = new URL(href).searchParams.get("text")!;
  expect(text).toContain("Mermaid Tear (Clear crystal)");
  expect(text).toContain(page.url().split("/").pop()!);
});

test("quick-add on mobile, and another device can't see the customer's address", async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop?category=earrings");
  await page.getByRole("button", { name: "Add to bag" }).first().click();
  const drawer = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Checkout" }).click();

  await fillAddress(page);
  await page.getByRole("button", { name: /place order/i }).click();
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
  await expect(page.getByText("House 12, Street 5")).toBeVisible();

  // Same link opened elsewhere gets the redacted public view.
  const other = await browser.newPage();
  await other.goto(page.url());
  await expect(other.getByRole("heading", { name: "Order placed" })).toBeVisible();
  await expect(other.getByText("Lahore, Punjab")).toBeVisible();
  await expect(other.getByText("House 12, Street 5")).toHaveCount(0);
  await other.close();
});
