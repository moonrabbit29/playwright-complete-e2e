import {
  test as base,
  BrowserContext,
  LaunchOptions,
  Page,
  Logger,
  ConsoleMessage,
  Request,
} from "@playwright/test";
import { createLogger } from "@shared/logger";

type LogSeverity = "verbose" | "info" | "warning" | "error";

export const pageBase = base.extend<{
  context: BrowserContext;
  page: BrowserContext;
  launchOptions: LaunchOptions;
  saveLogs: void;
}>({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },

  launchOptions: async ({}, use) => {
    const logger: Logger = {
      isEnabled: (name: string) => name === "api",
      log: (
        name: string,
        severity: LogSeverity,
        message: string,
        args: any[]
      ) => console.log(`${name} ${severity} ${message} ${args.join(" ")}`),
    };
    await use({ logger });
  },

  saveLogs: [
    async ({ page }, use, testInfo) => {
      const logTag = `[W${testInfo.workerIndex}] WEB:${testInfo.title}`;
      const log = createLogger(logTag);

      const onLoad = (p: Page, label: string) =>
        log.info(`${label}: ${p.url()}`);
      page.on("domcontentloaded", (p) => onLoad(p, "DOMContentLoaded"));
      page.on("load", (p) => onLoad(p, "Load"));

      page.on("console", (m: ConsoleMessage) =>
        log.debug(`Console: ${m.type()} "${m.text()}"`)
      );
      page.on("pageerror", (e: Error) => log.error(`PAGE ERROR: ${e.message}`));

      const reqLog = (r: Request, label: string) =>
        log.debug(`${label}: ${r.method()} ${r.url()} ${r.resourceType()}`);
      page.on("request", (r) => reqLog(r, "Request"));
      page.on("requestfinished", (r) => reqLog(r, "Request Finished"));
      page.on("requestfailed", (r) => reqLog(r, "REQUEST FAILED"));

      await use();
    },
    { auto: true },
  ],
});
