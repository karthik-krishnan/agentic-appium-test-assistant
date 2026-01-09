# Test Case Writing Using Appium MCP Server (Cucumber / BDD)

Use this document as a guide when writing **Cucumber-based end-to-end test cases** using the Appium MCP server.

The goal is to generate **clear, maintainable, BDD-style mobile tests** that are easy for QA engineers to review and extend.

---

## Key Development Patterns

### 1. **Cucumber BDD Structure**
All tests must be written using **Gherkin feature files** and **step definitions**.

- Feature files describe **behavior**
- Step definitions implement **automation logic**

---

## 2. **Gherkin Feature Files**

### Guidelines
- Use **Given / When / Then**
- Keep steps **business-readable**
- Avoid implementation details in feature files
- Use **Background** for common setup
- One main scenario per feature unless variations are required

### Example: Feature File

```gherkin
Feature: Settings Fonts Navigation

  Background:
    Given the iOS Settings app is launched

  Scenario: Verify Arial font is available in System Fonts
    When I navigate to "General"
    And I navigate to "Fonts"
    And I navigate to "System Fonts"
    Then I should see "Arial" listed in the fonts
```

📁 Save feature files under:
```
features/settings/fonts.feature
```

---

## 3. **Step Definitions (WebdriverIO + Appium)**

### Guidelines
- Use **async/await**
- Each step should perform **one clear action**
- Steps must map **1:1** to Gherkin statements
- Do not include assertions in `Given` or `When`
- Assertions belong in `Then`

### Example: Step Definitions

```javascript
import { Given, When, Then } from "@wdio/cucumber-framework";
import SettingsScreen from "../screen-objects/settings.screen.js";
import FontsScreen from "../screen-objects/fonts.screen.js";

Given("the iOS Settings app is launched", async () => {
  await SettingsScreen.launchSettingsApp();
});

When("I navigate to {string}", async (menuName) => {
  await SettingsScreen.tapMenu(menuName);
});

Then("I should see {string} listed in the fonts", async (fontName) => {
  const isVisible = await FontsScreen.isFontVisible(fontName);
  expect(isVisible).toBe(true);
});
```

📁 Save step definitions under:
```
features/step-definitions/settings.steps.js
```

---

## 4. **Page Object Model (Required)**

### Guidelines
- Each screen has its own class
- Selectors must be centralized
- Expose **business actions**, not raw clicks
- Prefer accessibility IDs over XPath

### Example: Page Object

```javascript
class SettingsScreen {
  async launchSettingsApp() {
    await driver.activateApp("
