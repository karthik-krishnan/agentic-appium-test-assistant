# Agentic Appium Test Assistant

AI-powered E2E test automation framework for iOS apps using Appium, WebdriverIO, and Cucumber BDD. This project enables developers and QA engineers to **generate automated tests using natural language instructions** with AI assistants like Claude Code, GitHub Copilot, or ChatGPT.

## 🤖 AI-Powered Test Generation

This framework is designed to work seamlessly with AI coding assistants. Simply describe your test scenario in natural language, and the AI will generate the complete test implementation following best practices.

### Why Use This Project?

✨ **No Test Automation Experience Required** - Describe what you want to test in plain English

⚡ **10x Faster Test Creation** - Generate complete tests in seconds vs hours of manual coding

🎯 **Best Practices Built-In** - AI follows Page Object Model, BDD, and Cucumber standards automatically

🔄 **Consistent Code Quality** - Every test follows the same patterns and conventions

🧪 **Production-Ready Tests** - Generated tests include error handling, fallback selectors, and proper waits

### How It Works

The project includes AI guidance files (`.github/copilot-instructions-cucumber.md`) that teach coding assistants how to:
- Write Gherkin feature files with proper BDD syntax
- Implement step definitions following the Page Object Model
- Create reusable page object methods with robust selectors
- Follow Cucumber best practices and naming conventions
- Use iOS-specific element locators (XPath, Predicate strings)
- Handle dynamic elements and page navigation

## 📋 Overview

This project demonstrates automated E2E testing of iOS apps using:
- **Appium** - Mobile automation framework
- **WebdriverIO** - Test automation framework
- **Cucumber** - BDD framework for writing human-readable tests
- **Page Object Model** - Design pattern for maintainable test code
- **AI-Assisted Development** - Natural language test generation

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

## 📝 Creating New Tests with AI

### Quick Start: AI-Assisted Test Creation

Simply provide natural language instructions to your AI assistant, and it will generate the complete test for you!

**Example Instruction:**

```
1. Start Appium and launch App "com.apple.Preferences"
2. Click on "General" and make sure its switching page
3. Click on "Dictionary" and make sure its switching to Dictionary Page
4. Now verify that the page has "Bulgarian" Dictionary listed
5. Write these steps as an E2E test case using Appium & WebdriverIO.
Follow guidelines in copilot-instructions-cucumber.md.
```

**What the AI Will Generate:**

✅ **Feature File** (`features/dictionary.feature`)
```gherkin
Feature: iOS Settings Dictionary Navigation

  Background:
    Given I launch the Settings app

  Scenario: Verify Bulgarian dictionary is available in Dictionary
    When I open General
    And I open Dictionary
    Then I should see "Bulgarian" dictionary listed
```

✅ **Step Definitions** (added to `features/step-definitions/settings.steps.js`)
```javascript
When('I open Dictionary', async () => {
    await SettingsPage.openDictionary()
})

Then('I should see {string} dictionary listed', async (dictionaryName) => {
    const isListed = await SettingsPage.isDictionaryListed(dictionaryName)
    if (!isListed) {
        throw new Error(`Dictionary "${dictionaryName}" is not listed`)
    }
})
```

✅ **Page Object Methods** (added to `features/pageobjects/settings.page.js`)
```javascript
async openDictionary() {
    const btnPredicate = '-ios predicate string:type == "XCUIElementTypeButton" AND label == "Dictionary"'
    const dictionaryBtn = await $(btnPredicate)
    await dictionaryBtn.click()
}

async isDictionaryListed(dictionaryName) {
    const selectors = [
        `//XCUIElementTypeStaticText[@name='${dictionaryName}']`,
        `-ios predicate string:label CONTAINS '${dictionaryName}'`
    ]
    // Tries multiple selectors for robust element location
}
```

### AI Coding Assistants Supported

- **Claude Code** (Recommended) - Full context awareness and autonomous test generation
- **GitHub Copilot** - Inline suggestions and test generation
- **ChatGPT** - Copy/paste workflow for test generation
- **Cursor** - AI-powered IDE with full project context

### Manual Test Creation (Without AI)

If you prefer to write tests manually, follow these steps:

1. Create a `.feature` file in `features/` directory
2. Write Gherkin scenarios using Given/When/Then
3. Implement step definitions in `features/step-definitions/`
4. Add page object methods in `features/pageobjects/settings.page.js`
5. Run tests and verify they pass

Refer to `.github/copilot-instructions-cucumber.md` for detailed guidelines.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and BDD patterns.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Created with assistance from Claude Code - AI-powered coding assistant.
