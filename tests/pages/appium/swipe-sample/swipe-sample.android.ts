import { TestLogger } from "@shared/logger";
import { SwipeSample } from "./swipe-sample";
import Gestures from "src/appium/helpers/gesture"
import { type Browser as WdioDriver } from "webdriverio";


export class SwipeSampleAndroid extends SwipeSample {
    constructor(driver: WdioDriver, log: TestLogger) { super(driver, log); }

  private cardByText(text: string) {
    const selector = `new UiSelector().text("${text}").className("android.widget.TextView")`;
    return this.driver.$(`android=${selector}`);
  }

  get cardTitleOpenSource() {
    return this.cardByText("FULLY OPEN SOURCE");
  }

  get cardTitleGreatCommunity() {
    return this.cardByText("GREAT COMMUNITY");
  }

  async getGreatCommunityText(): Promise<string> {
    return await this.cardTitleGreatCommunity.getText();
  }


  async swipeOpenSourceCardLeft(): Promise<void> {
    await this.driver.pause(1000);

    const element = this.cardTitleOpenSource;
    const rect = await element.getWindowRect();
    const center = {
      x: Math.round(rect.x + rect.width / 2),
      y: Math.round(rect.y + rect.height / 2),
    };

    const newX = 300;

    await   Gestures.swipe(this.driver,{ x: center.x, y: center.y }, { x: newX, y: center.y });
  }

  async isOpenSourceVisible(): Promise<boolean> {
    return await this.cardTitleOpenSource.isDisplayed();
  }

  async openSwipeMenu():Promise<void> {
    await this.driver.$('~Swipe').click();
  }
}