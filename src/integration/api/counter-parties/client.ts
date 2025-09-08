import { APIRequestContext } from "@playwright/test";
import { CounterpartyListSchema,CounterpartyList } from "integration/api/counter-parties/schema/counterparty.schema";

import {compileSchema} from 'integration/api/_helper'

//pre compile schema
const parseCounterparty = compileSchema<CounterpartyList>(CounterpartyListSchema);

export class CounterpartiesClient {
  constructor(private api: APIRequestContext) {}

  async getList(status: number = 200): Promise<CounterpartyList> {
    const res = await this.api.get("api/counterparties");
    const data = await parseCounterparty(res, status); 
    return data
  }
}
