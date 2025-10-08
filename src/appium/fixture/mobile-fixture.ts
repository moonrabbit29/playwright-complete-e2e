// src/appium/fixture/mobile-fixture.ts
import { test as base, expect, type TestInfo, type WorkerInfo } from "@playwright/test";
import { remote, type Browser as WdioDriver } from "webdriverio";
import { createLogger, type TestLogger } from "@shared/logger";
import baseCaps from "appiumCapabilities.json";
import path from "node:path";
import fs from "node:fs";

type Platform = "Android" | "iOS";

export const MobileBase = base.extend<
  {
    mlog: TestLogger;
    resetApp: () => Promise<void>;
    sessionArtifacts: void;
    recordVideo: void;
  },
  { wPlatform: Platform; driver: WdioDriver; workerLog: TestLogger }
>({
  wPlatform: [
    async ({}, use) => {
      await use((process.env.PLATFORM ?? "Android") as Platform);
    },
    { scope: "worker" },
  ],

  workerLog: [
    async ({}, use, workerInfo: WorkerInfo) => {
      const logger = createLogger(
        `[W${workerInfo.workerIndex}] ${workerInfo.project.name}`,
        "info"
      );
      await use(logger);
    },
    { scope: "worker" },
  ],

  driver: [
    async ({ wPlatform, workerLog }, use, workerInfo: WorkerInfo) => {
      const host = process.env.APPIUM_HOST ?? "127.0.0.1";
      const port = +(process.env.APPIUM_PORT ?? 4723);
      const pathBase = process.env.APPIUM_PATH ?? "/";
      const user = process.env.BROWSERSTACK_USERNAME;
      const key = process.env.BROWSERSTACK_ACCESS_KEY;
      const isBS = !!(user && key);
      const caps = isBS
        ? {
            ...baseCaps,
            "bstack:options": {
              projectName: process.env.BS_PROJECT ?? "App Mobile",
              buildName:
                process.env.BS_BUILD ?? `build-${new Date().toISOString()}`,
              sessionName: `worker-${workerInfo.workerIndex}`,
              networkLogs: true,
              appiumLogs: true,
              video: (process.env.MOBILE_VIDEO ?? "on") !== "off",
            },
          }
        : baseCaps;

      workerLog.info(
        `Starting Appium session on ${host}:${port}${pathBase} (${wPlatform})`
      );

      const driver = await remote({
        protocol: "http",
        hostname: host,
        port,
        path: pathBase,
        capabilities: caps,
        logLevel: "error",
        connectionRetryCount: 3,
        connectionRetryTimeout: 120_000,
      });

      try {
        await use(driver);
      } finally {
        workerLog.info("Cleaning up Appium session...");
        try {
          await driver.deleteSession();
        } catch (err) {
          workerLog.warn(
            `Failed to delete Appium session: ${(err as Error).message}`
          );
        }
      }
    },
    { scope: "worker" },
  ],


  mlog: async ({}, use, testInfo: TestInfo) => {
    const logger = createLogger(
      `[W${testInfo.workerIndex}] ${testInfo.title}`,
      "info"
    );
    await use(logger);
  },

  resetApp: async ({ driver, wPlatform, mlog }, use) => {
    await use(async () => {
      try {
        if (wPlatform === "Android" && process.env.APP_PKG) {
          await driver.terminateApp(process.env.APP_PKG);
          await driver.activateApp(process.env.APP_PKG);
        } else if (wPlatform === "iOS" && process.env.IOS_BUNDLE_ID) {
          await driver.terminateApp(process.env.IOS_BUNDLE_ID);
          await driver.activateApp(process.env.IOS_BUNDLE_ID);
        }
      } catch (e) {
        mlog.warn(`resetApp failed: ${(e as Error).message}`);
      }
    });
  },

  recordVideo: async ({ driver }, use, testInfo: TestInfo) => {
    // Mode: off | on | only-on-failure
    const mode = (process.env.MOBILE_VIDEO ?? "only-on-failure").toLowerCase();
    const shouldTryRecord = mode !== "off";

    if (shouldTryRecord) {
      try {
        await driver.startRecordingScreen({
          timeLimit: "300",
          videoQuality: "medium",
        } as any);
      } catch {}
    }

    await use();

    if (shouldTryRecord) {
      try {
        const base64 = await driver.stopRecordingScreen();
        if (!base64) return;

        // only-on-failure
        if (mode === "only-on-failure" && testInfo.status === "passed") return;

        const buf = Buffer.from(base64, "base64");
        const file = testInfo.outputPath("mobile-recording.mp4");
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, buf);

        await testInfo.attach("mobile-video", {
          path: file,
          contentType: "video/mp4",
        });
      } catch {
        // noop
      }
    }
  },

  sessionArtifacts: async ({ driver }, use, testInfo: TestInfo) => {
    await use();
    try {
      const base64 = await driver.takeScreenshot();
      await testInfo.attach("screenshot", {
        body: Buffer.from(base64, "base64"),
        contentType: "image/png",
      });
    } catch {
      // noop
    }
  },
});

export {expect}
