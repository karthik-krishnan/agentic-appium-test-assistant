import { $ } from '@wdio/globals'
import Page from './page.js'

class SettingsPage extends Page {
    async launchApp () {
        const bundleId = 'com.apple.Preferences'
        try {
            await driver.execute('mobile: terminateApp', { bundleId })
        } catch (err) {
            // ignore if app not running or terminate fails
        }
        await driver.execute('mobile: launchApp', { bundleId })
        await browser.pause(3000)
    }

    async openGeneral () {
        const btnPredicate = '-ios predicate string:name == "com.apple.settings.general"'
        try {
            const generalBtn = await $(btnPredicate)
            await generalBtn.waitForDisplayed({ timeout: 10000 })
            await generalBtn.click()
            await browser.pause(1000)
            return
        } catch (err) {
            const predicate = '-ios predicate string:name == "General"'
            const general = await $(predicate)
            await general.waitForDisplayed({ timeout: 10000 })
            await general.click()
            await browser.pause(1000)
        }
    }

    async openAbout () {
        const btnPredicate = '-ios predicate string:type == "XCUIElementTypeButton" AND label == "About"'
        try {
            const aboutBtn = await $(btnPredicate)
            await aboutBtn.waitForDisplayed({ timeout: 10000 })
            await aboutBtn.click()
            await browser.pause(1000)
            return
        } catch (err) {
            const fallback = await $("//XCUIElementTypeStaticText[@name='About']")
            await fallback.waitForDisplayed({ timeout: 10000 })
            await fallback.click()
            await browser.pause(1000)
        }
    }

    async openFonts () {
        const fontsBtn = await $("-ios predicate string:type == 'XCUIElementTypeButton' AND label == 'Fonts'")
        if (await fontsBtn.isDisplayed()) {
            await fontsBtn.click()
            await browser.pause(1000)
            return
        }

        const fontsFallback = await $("//XCUIElementTypeStaticText[@name='Fonts']")
        await fontsFallback.waitForDisplayed({ timeout: 10000 })
        await fontsFallback.click()
        await browser.pause(1000)
    }

    async isFontListed (fontName) {
        const fontEl = await $(`//XCUIElementTypeStaticText[@name='${fontName}']`)
        try {
            return await fontEl.isDisplayed()
        } catch (err) {
            return false
        }
    }

    async openSystemFonts () {
        const sysBtn = await $("-ios predicate string:type == 'XCUIElementTypeButton' AND label == 'System Fonts'")
        try {
            if (await sysBtn.isDisplayed()) {
                await sysBtn.click()
                await browser.pause(1000)
                return
            }
        } catch (err) {
            // fallback if predicate not found or not displayed
        }

        const fallback = await $("//XCUIElementTypeStaticText[@name='System Fonts']")
        await fallback.waitForDisplayed({ timeout: 10000 })
        await fallback.click()
        await browser.pause(1000)
    }

    async getModelValue () {
        const modelValue = await $("//XCUIElementTypeStaticText[@name='Model Number']/following::XCUIElementTypeStaticText[1]")
        await modelValue.waitForDisplayed({ timeout: 15000 })
        return await modelValue.getText()
    }

    async getApplicationsValue () {
        const appsValue = await $("//XCUIElementTypeStaticText[@name='Applications']/following::XCUIElementTypeStaticText[1]")
        await appsValue.waitForDisplayed({ timeout: 10000 })
        return await appsValue.getText()
    }

    async getNameValue () {
        const nameValue = await $("//XCUIElementTypeStaticText[@name='Name']/following::XCUIElementTypeStaticText[1]")
        await nameValue.waitForDisplayed({ timeout: 10000 })
        return await nameValue.getText()
    }

    async getSongsValue () {
        const songsValue = await $("//XCUIElementTypeStaticText[@name='Songs']/following::XCUIElementTypeStaticText[1]")
        await songsValue.waitForDisplayed({ timeout: 10000 })
        return await songsValue.getText()
    }

    async getSerialNumber () {
        const serialNumberValue = await $("//XCUIElementTypeCell[@name='SerialNumber']//XCUIElementTypeStaticText[position()=2]")
        await serialNumberValue.waitForDisplayed({ timeout: 10000 })
        return await serialNumberValue.getText()
    }

    async getIOSVersion () {
        const iosVersionValue = await $("//XCUIElementTypeCell[@name='SW_VERSION_SPECIFIER']//XCUIElementTypeStaticText[position()=2]")
        await iosVersionValue.waitForDisplayed({ timeout: 10000 })
        return await iosVersionValue.getText()
    }

    async openAccessibility () {
        const btnPredicate = '-ios predicate string:name == "com.apple.settings.accessibility"'
        try {
            const accessibilityBtn = await $(btnPredicate)
            await accessibilityBtn.waitForDisplayed({ timeout: 10000 })
            await accessibilityBtn.click()
            await browser.pause(2000)
            return
        } catch (err) {
            const fallback = await $("//XCUIElementTypeButton[@name='com.apple.settings.accessibility']")
            await fallback.waitForDisplayed({ timeout: 10000 })
            await fallback.click()
            await browser.pause(2000)
        }
    }

    async openDisplayAndTextSize () {
        const btnPredicate = '-ios predicate string:name == "DISPLAY_AND_TEXT"'
        try {
            const displayTextBtn = await $(btnPredicate)
            await displayTextBtn.waitForDisplayed({ timeout: 10000 })
            await displayTextBtn.click()
            await browser.pause(2000)
            return
        } catch (err) {
            const fallback = await $("//XCUIElementTypeButton[@name='DISPLAY_AND_TEXT']")
            await fallback.waitForDisplayed({ timeout: 10000 })
            await fallback.click()
            await browser.pause(2000)
        }
    }

    async getLargerTextStatus () {
        const largerTextElement = await $('-ios predicate string:name == "LARGER_TEXT"')
        await largerTextElement.waitForDisplayed({ timeout: 10000 })
        return await largerTextElement.getText()
    }

    async openDictionary () {
        const btnPredicate = '-ios predicate string:type == "XCUIElementTypeButton" AND label == "Dictionary"'
        try {
            const dictionaryBtn = await $(btnPredicate)
            await dictionaryBtn.waitForDisplayed({ timeout: 10000 })
            await dictionaryBtn.click()
            await browser.pause(1000)
            return
        } catch (err) {
            const fallback = await $("//XCUIElementTypeStaticText[@name='Dictionary']")
            await fallback.waitForDisplayed({ timeout: 10000 })
            await fallback.click()
            await browser.pause(1000)
        }
    }

    async isDictionaryListed (dictionaryName) {
        // Try different element types that might contain the dictionary name
        const selectors = [
            `//XCUIElementTypeStaticText[@name='${dictionaryName}']`,
            `//XCUIElementTypeCell[contains(@name, '${dictionaryName}')]`,
            `//XCUIElementTypeButton[@name='${dictionaryName}']`,
            `-ios predicate string:label CONTAINS '${dictionaryName}'`
        ]

        for (const selector of selectors) {
            try {
                const element = await $(selector)
                if (await element.isDisplayed()) {
                    return true
                }
            } catch (err) {
                // Continue to next selector
            }
        }
        return false
    }
}

export default new SettingsPage()
