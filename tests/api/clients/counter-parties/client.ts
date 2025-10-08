import { APIRequestContext } from "@playwright/test";
import { CounterpartyListSchema,CounterpartyList } from "tests/api/schema/counterparty.schema";

import {compileSchema} from 'src/api/helper/schema-validator'

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
