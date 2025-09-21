import { APIResponse, expect } from "@playwright/test";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import Ajv, { DefinedError } from "ajv";
import addFormats from "ajv-formats";

export const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export function formatAjvErrors(errors:any) {
  const list = Array.isArray(errors) ? errors : [];
  return list
    .map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`.trim())
    .join("; ");
}

export function compileSchema<s>(schema: unknown) {
  const validate = ajv.compile(schema as any);
  return async function validateAndParse(
    res: APIResponse,
    expectedStatus = 200
  ): Promise<s> {
    const status = res.status();
    const body = await res.json();

    expect(status, `Verify status: ${status} is equal to expected status ${expectedStatus}`).toBe(expectedStatus);

    const schemaOk = validate(body);
    expect.soft(schemaOk, `Is schema matched?`).toBe(true);
    if (!schemaOk) {
      const details = formatAjvErrors(validate.errors);
      throw new Error(`Schema validation failed: ${details}`);
    }

    return body as s;
  };
}
export type InferFromSchema<S extends JSONSchema> = FromSchema<S>;
