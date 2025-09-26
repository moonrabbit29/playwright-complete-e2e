// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    trace: "on",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "api:contract",
      testMatch: ["api/**/contract.spec.ts"],
      use: {
        trace: "on",
        screenshot: "off",
        video: "off",
        baseURL: process.env.BASE_URL ?? "http://localhost:3000/",
      },
    },
    {
      name: "ui:chromium",
      testMatch: ["**/*.ui.spec.ts", "**/*.spec.ts"], // kalau mau gabung UI biasa
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.APP_URL ?? "https://www.bookcabin.com",
      },
    },
    {
      name: "ui:firefox",
      testMatch: ["**/*.ui.spec.ts", "**/*.spec.ts"],
      use: {
        ...devices["Desktop Firefox"],
        baseURL: process.env.APP_URL ?? "https://www.bookcabin.com",
      },
    },
    {
      name: "ui:webkit",
      testMatch: ["**/*.ui.spec.ts", "**/*.spec.ts"],
      use: {
        ...devices["Desktop Safari"],
        baseURL: process.env.APP_URL ?? "https://www.bookcabin.com",
      },
    },
  ],
});
