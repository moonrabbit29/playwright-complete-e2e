import { webBase as test, expect } from "src/web/fixture/web-fixture";
import { FlightSearchPage } from "tests/pages/web/dweb/flight-search/flight-search-page";

test.describe("Flight one trip search", () => {
  test("Search same route", async ({ page, logger }) => {
    const search = new FlightSearchPage(page, logger);
    await search.navigate();
    search.chooseOneWay();

    logger.info("Assertion after choosing one-way");
    await expect(page.getByTestId("results")).toBeVisible({ timeout: 10_000 });
  });
});
