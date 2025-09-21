import {
  test as base,
  BrowserContext,
  LaunchOptions,
  Page,
  Logger,
  ConsoleMessage,
  Request
} from "@playwright/test";

type LogSeverity = "verbose" | "info" | "warning" | "error";

export const pageBase = base.extend<{
  context: BrowserContext;
  page: BrowserContext;
  launchOptions: LaunchOptions;
  saveLogs : void
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

  saveLogs: [async ({ page }, use) => {
        const getDate = () => new Date().toISOString();

        const listenerPageLoad = (page: Page, label: string) => { console.log(`${getDate()} ${label}: ${page.url()}`); }
        page.on('domcontentloaded', page => listenerPageLoad(page, 'Event DOMContentLoad'));
        page.on('load', page => listenerPageLoad(page, 'Event Load'));
        page.on('console', (message: ConsoleMessage) => console.log(`${getDate()} Event Console: ${message.text()}`));
        page.on('pageerror', (error: Error) => console.log(`${getDate()} ## PAGE ERROR ##: ${error.message}`));

        const listenerRequest = (request: Request, label: string) => { console.log(`${getDate()} ${label}: ${request.url()} ${request.resourceType()}`) };
        page.on('request', request => listenerRequest(request, 'Request'));
        page.on('requestfinished', request => listenerRequest(request, 'Request Finished'));
        page.on('requestfailed', request => listenerRequest(request, '## REQUEST FAILED ##'));

        await use();
    }, { auto: true }], //TODO change to optional
});
