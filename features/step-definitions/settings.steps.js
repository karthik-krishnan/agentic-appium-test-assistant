import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@wdio/globals'
import SettingsPage from '../pageobjects/settings.page.js'

Given('I launch the Settings app', async () => {
    await SettingsPage.launchApp()
})

When('I open General', async () => {
    await SettingsPage.openGeneral()
})

When('I open About', async () => {
    await SettingsPage.openAbout()
})

Then('the Model value should be alphanumeric', async () => {
    const model = await SettingsPage.getModelValue()
    if (!/^[A-Za-z0-9/]+$/.test(model)) {
        throw new Error(`Model value is not alphanumeric with forward slash: ${model}`)
    }
})

Then('the Name value should be {string}', async (expected) => {
    const name = await SettingsPage.getNameValue()
    if (name.toString() !== expected) {
        throw new Error(`Expected Name to be ${expected}, but got: ${name}`)
    }
})

When('I open Fonts', async () => {
    await SettingsPage.openFonts()
})

When('I open System Fonts', async () => {
    await SettingsPage.openSystemFonts()
})

Then('I should see {string} font listed', async (fontName) => {
    const isListed = await SettingsPage.isFontListed(fontName)
    if (!isListed) {
        throw new Error(`Font "${fontName}" is not listed`)
    }
})

When('I open Dictionary', async () => {
    await SettingsPage.openDictionary()
})

Then('I should see {string} dictionary listed', async (dictionaryName) => {
    const isListed = await SettingsPage.isDictionaryListed(dictionaryName)
    if (!isListed) {
        throw new Error(`Dictionary "${dictionaryName}" is not listed`)
    }
})
