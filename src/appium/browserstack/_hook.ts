import { MobileBase as test } from 'src/appium/fixture/mobile-fixture';


//TODO to test run in BS

test.beforeEach(async ({ driver }, testInfo) => {
  if (process.env.BROWSERSTACK_USERNAME) {
    await driver.execute(
      `browserstack_executor: {"action":"setSessionName","arguments":{"name":"${testInfo.title}"}}`
    );
  }
});

test.afterEach(async ({ driver }, testInfo) => {
  if (process.env.BROWSERSTACK_USERNAME) {
    const status = testInfo.status === 'passed' ? 'passed' : 'failed';
    const reason = testInfo.error ? testInfo.error.message : 'ok';
    await driver.execute(
      `browserstack_executor: {"action":"setSessionStatus","arguments":{"status":"${status}","reason":"${reason}"}}`
    );
  }
});
