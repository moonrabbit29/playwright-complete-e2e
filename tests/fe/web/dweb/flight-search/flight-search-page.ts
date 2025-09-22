import { expect, Locator, Page } from "@playwright/test";

export class FlightSearchPage {
  readonly page: Page;
  readonly one_way_radio_btn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.one_way_radio_btn = this.page.locator("//button[@value='oneway']");
  }
  
  async goto() {
    await this.page.goto("/flight-search");
  }
}
