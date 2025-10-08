import { expect, Locator, Page } from "@playwright/test";
import { TestLogger } from "@shared/logger";

export class FlightSearchPage {
  readonly page: Page;
  readonly oneWayRadio: Locator;
  readonly roundTripRadio: Locator;
  readonly originInput: Locator;
  readonly destinationInput: Locator;
  readonly airportSearchInput: Locator;

  constructor(page: Page, private logger: TestLogger) {
    this.page = page;
    this.oneWayRadio = this.page.locator("//button[@value='oneway']");
    this.roundTripRadio = this.page.locator("//button[@value='round-trip']");
    this.originInput = this.page.locator("(//*[@data-slot='form-item'])[1]");
    this.destinationInput = this.page.locator("(//*[@data-slot='form-item'])[2]");
    this.airportSearchInput = this.page.locator("(//input[@data-slot='command-input'])[1]");
  }

  async navigate() {
    await this.page.goto("/flight-search");
    this.logger.debug("Navigated to Flight Search page");
  }

  getAirportOption(airportName: string): Locator {
    return this.page.locator(
      `//*[@data-slot='command-item' and .//*[contains(text(),'${airportName}')]]`
    );
  }

  selectAirportOption(airportName: string){
    this.getAirportOption(airportName).click()
  }

  chooseOneWay(){
    this.oneWayRadio.click
  }
}
