// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

function getTraceMode(){
  const x = process.env.TRACER_MODE
  if (x === 'on') return 'on';
  if (x === 'on-first-retry') return 'on-first-retry';
  if (x === 'retain-on-failure') return 'retain-on-failure';
  return 'off';
}

function getScreenShotMode(){
  // "on" | "on-first-retry" | "off" | "retain-on-failure"
  const x = process.env.SCREEN_SHOT_MODE
  if (x === 'on') return 'on';
  if (x === 'only-on-failure') return 'only-on-failure';
  if(x==='on-first-failure') return 'on-first-failure'
  return 'off';
}

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  reporter: [["html", { open: "never" }], ["list"]],
  projects: [
    {
      name: "api:contract",
      testMatch: ["api/**/contract.spec.ts"],
      use: {
        trace: "off",
        screenshot: "off",
        video: "off",
        baseURL: process.env.BASE_URL ?? "http://localhost:3000/",
      },
    },
    {
      name: "ui:chromium",
      testMatch: ["**/web/*.spec.ts"], 
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.APP_URL ?? "https://www.bookcabin.com",
        trace: getTraceMode(),
        screenshot: getScreenShotMode(),
        video: "off",
        headless : process.env.IS_HEADLESS === "true" ? true : false,
        viewport: {
          width: +(process.env.VIEWPORT_WIDTH ?? 1280),
          height: +(process.env.VIEWPORT_HEIGHT ?? 800),
        },
      },
    },
    {
      name: 'mobile:android',
      testMatch: ['**/appium/*.spec.ts'],
      fullyParallel: false,
      use: { trace: 'off', screenshot: 'off', video: 'off' },
    },
  ],
});
