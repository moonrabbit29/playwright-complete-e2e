import {
  test as base,
  BrowserContext,
  LaunchOptions,
  Page,
  Logger,
  ConsoleMessage,
  Request,
  expect,
} from "@playwright/test";
import { createLogger, TestLogger } from "@shared/logger";

type LogSeverity = "verbose" | "info" | "warning" | "error";

export const webBase = base.extend<{
  context: BrowserContext;
  page: BrowserContext;
  launchOptions: LaunchOptions;
  saveLogs: void;
  logger : TestLogger
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

  logger : async({},use,testInfo) =>{
      const logTag = `[W${testInfo.workerIndex}] API:${testInfo.title}`;
      const log = createLogger(logTag);
      use(log);
  },

  saveLogs: [
    async ({ page }, use, testInfo) => {
      const logTag = `[W${testInfo.workerIndex}] API:${testInfo.title}`;
      const log = createLogger(logTag);
      const enabled = /^1|true|yes$/i.test(process.env.WEB_LOG ?? "");
      if (!enabled) {
        await use();
        return;
      }

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

export {expect}
