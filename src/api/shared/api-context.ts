import {
  test as base,
  APIRequestContext,
  Logger,
  APIResponse,
  Request,
} from "@playwright/test";

import { tryStringify,truncate,normalizeHeaders } from "./text-helper";


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
      const logs: string[] = [];

      const logTag = `[W${testInfo.workerIndex}] ${testInfo.title}`;
      const log = (msg: string) =>
        logs.push(`${new Date().toISOString()} ${logTag} ${msg}`);

      api.fetch = async (
        url: string | Request,
        init: any
      ): Promise<APIResponse> => {
        const start = Date.now();
        const method = init?.method ?? "GET";
        const fullUrl = typeof url === "string" ? url : url.toString();
        const headers = normalizeHeaders(init?.headers);

        log(`[API →] ${method} ${fullUrl}`);
        if (Object.keys(headers).length)
          log(`[API →] headers: ${JSON.stringify(headers)}`);
        if (typeof init?.data !== "undefined")
          log(`[API →] body: ${tryStringify(init.data)}`);

        try {
          const res = await origFetch(url, init);
          if (/^1|true|yes$/i.test(process.env.API_LOG_BODY ?? "")) {
            try {
              // coba JSON dulu, kalau gagal fallback ke text
              const clonedText = await res.text(); // Playwright mengizinkan pemanggilan text() sekali
              console.log(
                `[API ←] ${res.status()} ${method} ${fullUrl} (${
                  Date.now() - start
                }ms) body=${truncate(clonedText)}`
              );
            } catch {
              console.log(
                `[API ←] ${res.status()} ${method} ${fullUrl} (${
                  Date.now() - start
                }ms) [body unreadable]`
              );
            }
          } else {
            console.log(
              `[API ←] ${res.status()} ${method} ${fullUrl} (${
                Date.now() - start
              }ms)`
            );
          }
          return res;
        } catch (e: any) {
          log(`[API ✖] ${method} ${fullUrl} error: ${e?.message || e}`);
          throw e;
        }
      };
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
