import { test, expect } from "@playwright/test";

// Pause at end of each test so video captures the final state
const VIDEO_PAUSE_MS = 3000;
// Pause before submitting so video shows the prompt
const PRE_SUBMIT_PAUSE_MS = 1000;

test.describe("Chat", () => {
  test.beforeEach(async ({ page }) => {
    page.on("requestfailed", (request) => {
      const url = request.url();
      const postData = request.postData();
      const bodySize = postData ? `${(postData.length / 1024).toFixed(1)}KB` : "no body";
      process.stderr.write(`[NETWORK FAILED] ${request.method()} ${url} (${bodySize}) — ${request.failure()?.errorText}\n`);
    });
  });

  test("authenticated user sees chat interface @light", async ({ page }) => {
    await page.goto("/");

    // Verify the chat input is visible
    const promptInput = page.getByPlaceholder("Send a message...");
    await expect(promptInput).toBeVisible();

    // Verify Sign Out button is visible
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();

    await page.waitForTimeout(VIDEO_PAUSE_MS);
  });

  test("chat input clears after sending @light", async ({ page }) => {
    await page.goto("/");

    const promptInput = page.getByPlaceholder("Send a message...");
    await expect(promptInput).toBeVisible();

    // Type a message
    await promptInput.fill("Test message");
    await expect(promptInput).toHaveValue("Test message");
    await page.waitForTimeout(PRE_SUBMIT_PAUSE_MS);

    // Submit via the send button
    await page.locator("form button[type='submit']").click();

    // Verify input is cleared after submission
    await expect(promptInput).toHaveValue("", { timeout: 5000 });

    await page.waitForTimeout(VIDEO_PAUSE_MS);
  });

  test("user can sign out @light", async ({ page }) => {
    await page.goto("/");

    // Verify we're authenticated
    await expect(page.getByPlaceholder("Send a message...")).toBeVisible();

    // Click Sign Out
    await page.getByRole("button", { name: "Sign Out" }).click();

    // Verify we're back on the login screen
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible({
      timeout: 10000,
    });

    await page.waitForTimeout(VIDEO_PAUSE_MS);
  });

  test("user can send a prompt and receive a response @full", async ({ page }) => {
    await page.goto("/");

    // Wait for the chat interface to be ready
    const promptInput = page.getByPlaceholder("Send a message...");
    await expect(promptInput).toBeVisible();

    // Type a simple prompt
    const testPrompt = "Hello, say hi back in one word";
    await promptInput.fill(testPrompt);
    await page.waitForTimeout(PRE_SUBMIT_PAUSE_MS);

    // Submit the prompt
    await page.locator("form button[type='submit']").click();

    // Wait for the user message to appear
    await expect(page.getByText(testPrompt)).toBeVisible({ timeout: 10000 });

    // Wait for an assistant response to appear (rendered by Streamdown)
    await expect(page.locator("[data-streamdown]")).toBeVisible({ timeout: 60000 });

    await page.waitForTimeout(VIDEO_PAUSE_MS);
  });
});
