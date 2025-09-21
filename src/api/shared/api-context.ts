import {
  test as base,
  APIRequestContext,
  Logger,
  APIResponse,
  Request,
} from "@playwright/test";

const REDACT_KEYS = new Set(["authorization", "x-api-key"]);

export const apiBase = base.extend<{ api: APIRequestContext; saveLog: void }>({
  api: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    await use(ctx);
    await ctx.dispose();
  },

  saveLog: async ({ api }, use, testInfo) => {
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
        log(
          `[API ←] ${res.status()} ${method} ${fullUrl} (${
            Date.now() - start
          }ms) Response \n ${tryStringify(res.json)}`
        );
        return res;
      } catch (e: any) {
        log(`[API ✖] ${method} ${fullUrl} error: ${e?.message || e}`);
        throw e;
      }
    };
    await use();
  },
});

function tryStringify(x: any) {
  try {
    return typeof x === "string" ? x : JSON.stringify(x);
  } catch {
    return "[unstringifiable]";
  }
}

//headers type from ApiContext are either object, array[][], Headers (playwright)
function normalizeHeaders(h: any): Record<string, string> {
  if (!h) return {};
  if (typeof h === "object" && typeof h.forEach === "function") {
    const out: Record<string, string> = {};
    h.array.forEach((k: any, v: any) => {
      out[k] = REDACT_KEYS.has(String(v)) ? "***redacted***" : String(v);
    });
    return out;
  }
  if (Array.isArray(h)) {
    Object.fromEntries(
      h.map(([k, v]) => [
        k,
        REDACT_KEYS.has(String(v)) ? "***redacted***" : String(v),
      ])
    );
  }
  return Object.fromEntries(
    Object.entries(h).map(([k, v]) => [
      k,
      REDACT_KEYS.has(String(v)) ? "***redacted***" : String(v),
    ])
  );
}

export { expect } from "@playwright/test";
