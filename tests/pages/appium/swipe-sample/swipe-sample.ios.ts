import { TestLogger } from "@shared/logger";
import { SwipeSample } from "./swipe-sample";
import { type Browser as WdioDriver } from "webdriverio";


export class SwipeSampleIos extends SwipeSample {
    isOpenSourceVisible(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    swipeOpenSourceCardLeft(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getGreatCommunityText(): Promise<String> {
        throw new Error("Method not implemented.");
    }
    constructor(driver: WdioDriver, log: TestLogger) { super(driver, log); }
}