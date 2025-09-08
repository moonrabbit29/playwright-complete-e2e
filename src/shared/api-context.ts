import { useApp } from "@excalidraw/excalidraw/types/components/App";
import {
  test as base,
  APIRequestContext,
  BrowserContext,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
} from "@playwright/test";

export const apiBase = base.extend<{ api: APIRequestContext }>({
  api: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from "@playwright/test";
