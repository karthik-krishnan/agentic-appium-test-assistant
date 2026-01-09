# Agentic Appium Test Assistant

End-to-End test automation framework for iOS Settings app using Appium, WebdriverIO, and Cucumber BDD.

## 📋 Overview

This project demonstrates automated E2E testing of the iOS Settings app using:
- **Appium** - Mobile automation framework
- **WebdriverIO** - Test automation framework
- **Cucumber** - BDD framework for writing human-readable tests
- **Page Object Model** - Design pattern for maintainable test code

## 🧪 Test Scenarios

### 1. Fonts Navigation Test
Verifies that system fonts are accessible and correctly displayed:
- Navigates to Settings → General → Fonts → System Fonts
- Verifies "Arial" font is listed
- Verifies "Apple Symbols" font is listed

### 2. Dictionary Navigation Test
Verifies that dictionaries are accessible:
- Navigates to Settings → General → Dictionary
- Verifies "Bulgarian" dictionary is listed

### 3. Settings Information Test
Validates device information in Settings:
- Navigates to Settings → General → About
- Verifies Model Number contains alphanumeric characters and forward slash
- Verifies Device Name is "iPhone"

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.x or higher)
- npm
- Xcode with iOS Simulator
- Appium installed globally or locally

### Installation

```bash
# Clone the repository
git clone git@github.com:karthik-krishnan/agentic-appium-test-assistant.git
cd agentic-appium-test-assistant

# Install dependencies
npm install
```

### Configuration

Update the device configuration in `wdio.conf.js`:

```javascript
capabilities: [{
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 17 Pro Max',
    'appium:platformVersion': '26.2',
    'appium:automationName': 'XCUITest',
    'appium:udid': 'YOUR-DEVICE-UDID'
}]
```

## 🏃 Running Tests

```bash
# Run all tests
npm run wdio

# Run specific test file
npm run wdio -- --spec features/fonts.feature
npm run wdio -- --spec features/dictionary.feature
npm run wdio -- --spec features/settings.feature
```

## 📁 Project Structure

```
.
├── features/
│   ├── fonts.feature              # Font navigation test scenarios
│   ├── dictionary.feature         # Dictionary navigation test scenarios
│   ├── settings.feature           # Settings information test scenarios
│   ├── pageobjects/
│   │   ├── page.js               # Base page object
│   │   └── settings.page.js      # Settings page object with all methods
│   └── step-definitions/
│       └── settings.steps.js     # Cucumber step definitions
├── .github/
│   ├── copilot-instructions.md          # General testing guidelines
│   └── copilot-instructions-cucumber.md # Cucumber/BDD specific guidelines
├── wdio.conf.js                  # WebdriverIO configuration
├── wdio.cucumber.conf.js         # Cucumber-specific configuration
└── package.json                  # Project dependencies
```

## 🎯 Key Features

### Page Object Model
Centralized element selectors and page interactions:
```javascript
async openFonts() {
    const btnPredicate = '-ios predicate string:type == "XCUIElementTypeButton" AND label == "Fonts"'
    const fontsBtn = await $(btnPredicate)
    await fontsBtn.click()
}
```

### BDD Gherkin Syntax
Human-readable test scenarios:
```gherkin
Feature: iOS Settings Fonts Navigation

  Scenario: Verify Arial and Apple Symbols fonts are available in System Fonts
    Given I launch the Settings app
    When I open General
    And I open Fonts
    And I open System Fonts
    Then I should see "Arial" font listed
    And I should see "Apple Symbols" font listed
```

### Robust Element Location
Multiple selector strategies with fallback:
```javascript
const selectors = [
    `//XCUIElementTypeStaticText[@name='${name}']`,
    `//XCUIElementTypeCell[contains(@name, '${name}')]`,
    `-ios predicate string:label CONTAINS '${name}'`
]
```

## 📊 Test Results

All tests are passing:
- ✅ Fonts Navigation Test (6 steps, ~11s)
- ✅ Dictionary Navigation Test (4 steps, ~11s)
- ✅ Settings Information Tests (8 steps, ~18s)

## 🛠️ Technologies Used

- **Appium** - v10.x
- **WebdriverIO** - v9.23.x
- **Cucumber** - v10.9.x
- **@wdio/cucumber-framework** - v9.23.x
- **appium-xcuitest-driver** - v10.14.x

## 📝 Writing New Tests

Follow the BDD guidelines in `.github/copilot-instructions-cucumber.md`:

1. Create a `.feature` file in `features/` directory
2. Write Gherkin scenarios using Given/When/Then
3. Implement step definitions in `features/step-definitions/`
4. Add page object methods in `features/pageobjects/settings.page.js`
5. Run tests and verify they pass

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and BDD patterns.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Created with assistance from Claude Code - AI-powered coding assistant.
