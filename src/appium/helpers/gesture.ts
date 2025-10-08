import type { Browser } from "webdriverio";

export default class Gestures {
  /**
   * @param driver WebdriverIO.Browser instance 
   * @param from Start point {x, y}
   * @param to End Point {x, y}
   * @param duration Swipe Duration
   */
  static async swipe(
    driver: Browser,
    from: { x: number; y: number },
    to: { x: number; y: number },
    duration = 800
  ): Promise<void> {
    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: from.x, y: from.y },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: 200 },
          { type: "pointerMove", duration, x: to.x, y: to.y },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
  }
}