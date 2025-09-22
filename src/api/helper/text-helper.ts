export function tryStringify(x: any) {
  try {
    return typeof x === "string" ? x : JSON.stringify(x);
  } catch {
    return "[unstringifiable]";
  }
}

export function truncate(s: string, max = 2000): string {
  return s.length > max ? `${s.slice(0, max)}…[truncated]` : s;
}

//headers type from ApiContext are either object, array[][], Headers (playwright)
export function normalizeHeaders(h: any): Record<string, string> {
const REDACT_KEYS = new Set(["authorization", "x-api-key"]);
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
