import {
  test as base,
  APIRequestContext,
  APIResponse,
  Request,
} from "@playwright/test";

import { truncate, normalizeHeaders } from "../helper/text-helper";
import { createLogger } from "@shared/logger";

export const apiBase = base.extend<{ api: APIRequestContext; saveLog: void }>({
  api: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    await use(ctx);
    await ctx.dispose();
  },

  saveLog: [
    async ({ api }, use, testInfo) => {
      const enabled = /^1|true|yes$/i.test(process.env.API_LOG ?? "");
      if (!enabled) {
        await use();
        return;
      }
      const origFetch = api.fetch.bind(api);
      const logTag = `[W${testInfo.workerIndex}] API:${testInfo.title}`;
      const log = createLogger(logTag);

      api.fetch = async (
        url: string | Request,
        init: any
      ): Promise<APIResponse> => {
        const start = Date.now();
        const method = init?.method ?? "GET";
        const fullUrl = typeof url === "string" ? url : url.toString();
        const headers = normalizeHeaders(init?.headers);

        if (Object.keys(headers).length != 0) {
          log.info(
            `[API -> ] ${method} ${fullUrl} headers=${JSON.stringify(
              headers
            )}`
          );
        } else {
          log.info(`[API -> ] ${method} ${fullUrl}`);
        }
        if (init?.data !== undefined) {
          const requestBody =
            typeof init.data === "string"
              ? init.data
              : JSON.stringify(init.data);
          log.debug(`body=${requestBody}`);
        }
        const showLogBody = process.env.API_LOG_BODY ?? "";
        try {
          const res = await origFetch(url, init);
          try {
            const clonedText = await res.text();
            switch (showLogBody) {
              case "full":
                log.debug(
                  `[API ←] ${res.status()} ${method} ${fullUrl} (${
                    Date.now() - start
                  }ms) body=${clonedText}`
                );
                break;
              case "truncate":
                log.debug(
                  `[API ←] ${res.status()} ${method} ${fullUrl} (${
                    Date.now() - start
                  }ms) body=${truncate(clonedText)}`
                );
                break;
              default:
                log.debug(
                  `[API ←] ${res.status()} ${method} ${fullUrl} (${
                    Date.now() - start
                  }ms)`
                );
            }
          } catch (e: any) {
            log.debug(
              `[API ←] ${res.status()} ${method} ${fullUrl} (${
                Date.now() - start
              }ms) [body unreadable]`
            );
          }
          return res;
        } catch (e: any) {
          log.error(`[API ✖] ${method} ${fullUrl} error: ${e?.message || e}`);
          throw e;
        }
      };
      await use();
      //await testInfo.attach('api.log', { body: logs.join('\n'), contentType: 'text/plain' });
      (api as any).fetch = origFetch;
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
