import { apiBase, expect } from "@api/fixture/api-fixture";
import { CounterpartiesClient } from "./client";

export const test = apiBase.extend<{ counterparties: CounterpartiesClient }>({
  counterparties: async ({ api }, use) => {
    await use(new CounterpartiesClient(api));
  },
});

export { expect };

test.describe("GET Counterparties", () => {
    test("GET counterparties value", async({counterparties})=>{
      const res = await counterparties.getList(200)
      expect(Array.isArray(res), "response need to be an array").toBe(true);
    })
});
