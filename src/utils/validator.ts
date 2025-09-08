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
