import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

const PRIVY_TEST_OTP = process.env.TEST_USER_OTP;
const PRIVY_TEST_EMAIL = process.env.TEST_USER_EMAIL;

setup("authenticate via Privy", async ({ page }) => {
  if (!PRIVY_TEST_EMAIL || !PRIVY_TEST_OTP) {
    // Create an empty storage state so downstream tests can start
    // (they'll fail on auth-gated UI, but won't crash on missing file)
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(true, "TEST_USER_EMAIL and TEST_USER_OTP must be set");
  }

  const email = PRIVY_TEST_EMAIL as string;
  const otp = PRIVY_TEST_OTP as string;

  await page.goto("/");

  // Wait for page to be ready
  await page.waitForLoadState("networkidle");

  // Click the Sign In button to open Privy modal
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for email input to appear in Privy modal
  const emailInput = page.getByPlaceholder(/email/i);
  await emailInput.waitFor({ timeout: 30000 });
  await emailInput.fill(email);

  // Click submit button to continue with email
  await page.getByRole("button", { name: "Submit" }).click();

  // Find and wait for OTP inputs to appear
  const otpInputs = page.locator(
    '[data-testid*="otp"] input, input[inputmode="numeric"], input[autocomplete="one-time-code"]'
  );
  await otpInputs.first().waitFor({ timeout: 30000 });

  const inputCount = await otpInputs.count();
  const otpDigits = otp.split("");

  if (inputCount >= 6) {
    // Individual digit inputs
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(otpDigits[i]);
    }
  } else if (inputCount === 1) {
    // Single input field for full OTP
    await otpInputs.first().fill(otp);
  }

  // Wait for authentication to complete — chat input becomes visible
  await expect(page.getByPlaceholder("Send a message...")).toBeVisible({
    timeout: 60000,
  });

  // Save authentication state
  await page.context().storageState({ path: authFile });

  console.log("Authentication successful! State saved.");
});
