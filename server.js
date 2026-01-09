import express from 'express'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import { Ollama } from 'ollama'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine which LLM provider to use
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'ollama' // 'openai' or 'ollama'

// Initialize LLM clients
let openai, ollama

if (LLM_PROVIDER === 'openai') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    console.log('🤖 Using OpenAI for test generation')
} else {
    ollama = new Ollama({
        host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    })
    console.log('🤖 Using Ollama (local LLM) for test generation')
}

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static('public'))

// Store test execution history
const testHistory = []

// Endpoint to generate and run tests
app.post('/api/generate-test', async (req, res) => {
    const { prompt } = req.body

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' })
    }

    const testId = Date.now().toString()
    const result = {
        id: testId,
        prompt,
        status: 'processing',
        timestamp: new Date().toISOString(),
        steps: []
    }

    testHistory.unshift(result)

    // Send immediate response
    res.json({ testId, status: 'processing', message: 'Test generation started' })

    // Process asynchronously
    processTestGeneration(testId, prompt, result)
})

async function processTestGeneration(testId, prompt, result) {
    try {
        // Step 1: Parse the prompt to extract test details
        result.steps.push({ step: 'Parsing prompt', status: 'running', timestamp: new Date().toISOString() })

        const testDetails = parsePrompt(prompt)
        result.testDetails = testDetails
        result.steps[result.steps.length - 1].status = 'completed'

        // Step 2: Generate test files
        result.steps.push({ step: 'Generating test files', status: 'running', timestamp: new Date().toISOString() })

        await generateTestFiles(testDetails)
        result.steps[result.steps.length - 1].status = 'completed'
        result.steps[result.steps.length - 1].files = testDetails.files

        // Step 3: Run the tests
        result.steps.push({ step: 'Running tests', status: 'running', timestamp: new Date().toISOString() })

        const testResult = await runTests(testDetails.featureFile)
        result.testResult = testResult
        result.steps[result.steps.length - 1].status = testResult.success ? 'completed' : 'failed'
        result.steps[result.steps.length - 1].output = testResult.output

        // Step 4: Validate results
        result.steps.push({ step: 'Validating results', status: 'running', timestamp: new Date().toISOString() })

        result.validation = validateTestResults(testResult)
        result.steps[result.steps.length - 1].status = 'completed'

        result.status = testResult.success ? 'completed' : 'failed'
    } catch (error) {
        result.status = 'error'
        result.error = error.message
        if (result.steps.length > 0) {
            result.steps[result.steps.length - 1].status = 'failed'
            result.steps[result.steps.length - 1].error = error.message
        }
    }
}

function parsePrompt(prompt) {
    // Extract key information from the prompt
    const lines = prompt.split('\n').filter(line => line.trim())

    // Try to identify the test type and generate a meaningful test name
    const testName = generateTestName(prompt)
    const featureFile = `features/${testName}.feature`

    return {
        prompt,
        testName,
        featureFile,
        files: [featureFile, 'features/step-definitions/settings.steps.js', 'features/pageobjects/settings.page.js']
    }
}

function generateTestName(prompt) {
    // Extract meaningful name from prompt
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('font')) {
        return 'fonts-ai-generated'
    } else if (lowerPrompt.includes('dictionary')) {
        return 'dictionary-ai-generated'
    } else if (lowerPrompt.includes('about')) {
        return 'settings-ai-generated'
    }

    return `test-${Date.now()}`
}

async function generateTestFiles(testDetails) {
    // Use OpenAI to generate test files based on the prompt
    const featurePath = path.join(__dirname, testDetails.featureFile)
    const stepsPath = path.join(__dirname, 'features/step-definitions/settings.steps.js')
    const pageObjectPath = path.join(__dirname, 'features/pageobjects/settings.page.js')

    // Read existing files to provide context
    let existingSteps = ''
    let existingPageObject = ''

    try {
        existingSteps = await fs.readFile(stepsPath, 'utf-8')
    } catch (err) {
        // File might not exist yet
    }

    try {
        existingPageObject = await fs.readFile(pageObjectPath, 'utf-8')
    } catch (err) {
        // File might not exist yet
    }

    // Create the AI prompt
    const systemPrompt = `You are an expert test automation engineer specializing in Appium, WebdriverIO, and Cucumber BDD for iOS testing.

Your task is to generate complete E2E test files based on user instructions.

Follow these strict guidelines:
1. Use Gherkin syntax for feature files (Given/When/Then)
2. Implement step definitions using async/await
3. Use Page Object Model pattern
4. Use iOS-specific selectors (XPath, Predicate strings)
5. Include fallback selectors for robust element location
6. Follow existing patterns in the codebase

Feature File Guidelines:
- Use "Feature:" to describe the test suite
- Use "Background:" for common setup (launching the app)
- Use "Scenario:" for individual test cases
- Steps should be business-readable, not technical

Step Definition Guidelines:
- Import: import { Given, When, Then } from '@wdio/cucumber-framework'
- Use async/await for all step functions
- Call page object methods, don't interact with elements directly
- Throw errors for failed assertions

Page Object Guidelines:
- Use iOS predicate strings: '-ios predicate string:type == "XCUIElementTypeButton" AND label == "ButtonName"'
- Use XPath selectors as fallback: '//XCUIElementTypeStaticText[@name="Text"]'
- Implement multiple selector strategies with try-catch for robustness
- Add scroll support using: driver.execute('mobile: scroll', { direction: 'down' })
- Return boolean for verification methods

Example existing pattern:
\`\`\`javascript
async isFontListed(fontName) {
    const selector = \`//XCUIElementTypeStaticText[@name='\${fontName}']\`

    try {
        const fontEl = await $(selector)
        if (await fontEl.isDisplayed()) {
            return true
        }
    } catch (err) {
        // Not visible, try scrolling
    }

    for (let i = 0; i < 10; i++) {
        try {
            await driver.execute('mobile: scroll', { direction: 'down' })
            await browser.pause(500)
            const fontEl = await $(selector)
            if (await fontEl.isDisplayed()) {
                return true
            }
        } catch (err) {
            // Continue scrolling
        }
    }
    return false
}
\`\`\`

IMPORTANT: Only generate NEW code that needs to be added. Do not duplicate existing step definitions or page object methods.`

    const userPrompt = `Generate test files for this test scenario:

${testDetails.prompt}

EXISTING STEP DEFINITIONS:
${existingSteps || 'None yet'}

EXISTING PAGE OBJECT METHODS:
${existingPageObject || 'None yet'}

Generate the following:
1. Feature file content (complete file)
2. New step definitions to add (only new ones not already present)
3. New page object methods to add (only new ones not already present)

Return your response in this exact JSON format:
{
  "featureFile": "complete feature file content here",
  "stepDefinitions": "new step definitions to add (or empty string if all exist)",
  "pageObjectMethods": "new page object methods to add (or empty string if all exist)",
  "explanation": "brief explanation of what was generated"
}`

    try {
        let response

        if (LLM_PROVIDER === 'openai') {
            // Use OpenAI
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7
            })
            response = JSON.parse(completion.choices[0].message.content)
        } else {
            // Use Ollama (local LLM)
            const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1'

            const completion = await ollama.chat({
                model: ollamaModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                format: 'json',
                options: {
                    temperature: 0.7
                }
            })

            response = JSON.parse(completion.message.content)
        }

        // Write the feature file
        await fs.writeFile(featurePath, response.featureFile, 'utf-8')
        console.log(`✅ Generated feature file: ${testDetails.featureFile}`)

        // Append new step definitions if any
        if (response.stepDefinitions && response.stepDefinitions.trim()) {
            await fs.appendFile(stepsPath, '\n\n' + response.stepDefinitions, 'utf-8')
            console.log(`✅ Added new step definitions`)
        }

        // Append new page object methods if any
        if (response.pageObjectMethods && response.pageObjectMethods.trim()) {
            // Read existing page object to insert before closing brace
            const pageObjectContent = await fs.readFile(pageObjectPath, 'utf-8')
            const lastBraceIndex = pageObjectContent.lastIndexOf('}')
            const updatedContent = pageObjectContent.slice(0, lastBraceIndex) +
                '\n' + response.pageObjectMethods + '\n' +
                pageObjectContent.slice(lastBraceIndex)
            await fs.writeFile(pageObjectPath, updatedContent, 'utf-8')
            console.log(`✅ Added new page object methods`)
        }

        console.log(`📝 ${response.explanation}`)

        testDetails.aiExplanation = response.explanation

    } catch (error) {
        console.error('❌ Error generating test files with OpenAI:', error.message)
        throw new Error(`AI generation failed: ${error.message}`)
    }
}

function runTests(featureFile) {
    return new Promise((resolve) => {
        const testProcess = spawn('npm', ['run', 'wdio', '--', '--spec', featureFile], {
            cwd: __dirname,
            env: {
                ...process.env,
                PATH: `/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${process.env.HOME}/.nvm/versions/node/v20.19.6/bin:${process.env.PATH}`
            }
        })

        let output = ''
        let errorOutput = ''

        testProcess.stdout.on('data', (data) => {
            output += data.toString()
        })

        testProcess.stderr.on('data', (data) => {
            errorOutput += data.toString()
        })

        testProcess.on('close', (code) => {
            const success = code === 0
            const passing = output.match(/(\d+) passing/)
            const failing = output.match(/(\d+) failing/)

            resolve({
                success,
                exitCode: code,
                output,
                errorOutput,
                summary: {
                    passing: passing ? parseInt(passing[1]) : 0,
                    failing: failing ? parseInt(failing[1]) : 0
                }
            })
        })
    })
}

function validateTestResults(testResult) {
    const validation = {
        passed: testResult.success,
        issues: []
    }

    if (!testResult.success) {
        validation.issues.push('Test execution failed')

        if (testResult.errorOutput.includes('ECONNREFUSED')) {
            validation.issues.push('Appium server not running')
        }

        if (testResult.output.includes('no such element')) {
            validation.issues.push('Element not found - selector may need adjustment')
        }
    }

    return validation
}

// Get test history
app.get('/api/test-history', (req, res) => {
    res.json(testHistory.slice(0, 10)) // Return last 10 tests
})

// Get specific test result
app.get('/api/test-result/:testId', (req, res) => {
    const test = testHistory.find(t => t.id === req.params.testId)

    if (!test) {
        return res.status(404).json({ error: 'Test not found' })
    }

    res.json(test)
})

// Get available test files
app.get('/api/test-files', async (req, res) => {
    try {
        const featuresDir = path.join(__dirname, 'features')
        const files = await fs.readdir(featuresDir)
        const featureFiles = files.filter(f => f.endsWith('.feature'))

        res.json(featureFiles)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`🚀 Agentic Appium Test Assistant GUI running on http://localhost:${PORT}`)
    console.log(`📝 Open your browser and navigate to http://localhost:${PORT}`)
})
