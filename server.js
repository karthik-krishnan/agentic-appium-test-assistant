import express from 'express'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    // In a real implementation, this would call an AI service
    // For now, we'll create a simple placeholder

    const featurePath = path.join(__dirname, testDetails.featureFile)

    // Check if file already exists
    try {
        await fs.access(featurePath)
        console.log(`Feature file ${testDetails.featureFile} already exists`)
    } catch {
        console.log(`Would generate: ${testDetails.featureFile}`)
        // In production, this would use Claude API or similar to generate the actual test
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
