import { test as base, APIRequestContext, BrowserContext, PlaywrightTestArgs, PlaywrightTestOptions } from '@playwright/test';

export const setupTest = base.extend<PlaywrightTestArgs & PlaywrightTestOptions & {
    apiContext: APIRequestContext;
}>({
    apiContext: async ({ playwright }, use) => {
        const context = await playwright.request.newContext({
            baseURL: 'https://www.batikair.com/en/',
            extraHTTPHeaders: { 'Content-Type': 'application/json' },
        });
        await use(context);
        await context.dispose();
    },
    context: async ({ browser }, use) => {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            permissions: ['geolocation']
        });

        await use(context);
        await context.close();
    }
});

export { expect } from '@playwright/test';