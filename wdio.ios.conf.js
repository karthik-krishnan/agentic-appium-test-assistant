import { config as baseConfig } from "./wdio.conf.js";

export const config = {
  ...baseConfig,

  // Override capabilities for iOS
  capabilities: [
    {
      // capabilities for local Appium native app tests on iOS Simulator
      platformName: "iOS",
      "appium:deviceName": "iPhone 17 Pro Max",
      "appium:platformVersion": "26.2",
      "appium:automationName": "XCUITest",
      "appium:uuid":
        "48D47471-4023-42A1-8EBC-1CF7B590AF56",
      "appium:noReset": false,
    },
  ],
};
