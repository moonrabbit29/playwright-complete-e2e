import type { Browser as WdioDriver } from "webdriverio";
import type { TestLogger } from "@shared/logger";
import { BaseMobilePage } from "src/appium/shared/base-mobile-page";

export type MobilePlatform = "Android" | "iOS";

export abstract class SwipeSample extends BaseMobilePage {
  abstract openSwipeMenu(): Promise<void>;
  abstract isOpenSourceVisible(): Promise<boolean>;
  abstract swipeOpenSourceCardLeft(): Promise<void>;
  abstract getGreatCommunityText(): Promise<String>;

  constructor(driver: WdioDriver, log: TestLogger) {
    super(driver, log);
  }

  static async create(
    platform: MobilePlatform,
    d: WdioDriver,
    log: TestLogger
  ): Promise<SwipeSample> {
    if (platform === "iOS") {
      const { SwipeSampleIos } = await import("./swipe-sample.ios");
      return new SwipeSampleIos(d, log);
    } else {
      const { SwipeSampleAndroid } = await import("./swipe-sample.android");
      return new SwipeSampleAndroid(d, log);
    }
  }
}
