import { MobileBase as test, expect } from "src/appium/fixture/mobile-fixture";
import { SwipeSample } from "tests/pages/appium/swipe-sample/swipe-sample";

test("Test Swipe page sample test ... ", async ({
  wPlatform,
  driver,
  mlog,
}) => {
  const swipePage = await SwipeSample.create(wPlatform, driver, mlog);
  await swipePage.swipeOpenSourceCardLeft();
  const visible = await swipePage.isOpenSourceVisible();

  mlog.info(`Visibility after swipe: ${visible}`);
  expect(visible).toBeTruthy();
});