import type { Browser as WdioDriver } from 'webdriverio';
import type { TestLogger } from '@shared/logger';

export abstract class BaseMobilePage {
    
  protected constructor(protected driver: WdioDriver, protected log: TestLogger) {

  }

  protected $(sel: string) { return this.driver.$(sel); }
  protected async waitVisible(el: WebdriverIO.Element, t = 10_000) { await el.waitForDisplayed({ timeout: t }); }
  protected async tap(el:  WebdriverIO.Element)  { await this.waitVisible(el); await el.click(); }
  protected async type(el:  WebdriverIO.Element, text: string) { await this.waitVisible(el); await el.setValue(text); }

  protected async switchToWebView() {
    const ctx = await this.driver.getContexts();
    const web = ctx.find(c => c.toString().toLowerCase().includes('webview'));
    if (web) await this.driver.switchContext(web);
  }
  
  protected async switchToNative() {
    const [native] = await this.driver.getContexts();
    if (native) await this.driver.switchContext(native);
  }
}