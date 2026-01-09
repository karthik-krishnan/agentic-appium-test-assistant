// DOM Elements
const testPrompt = document.getElementById('testPrompt')
const generateBtn = document.getElementById('generateBtn')
const progressSection = document.getElementById('progressSection')
const progressSteps = document.getElementById('progressSteps')
const resultsSection = document.getElementById('resultsSection')
const testResults = document.getElementById('testResults')
const testHistory = document.getElementById('testHistory')

let currentTestId = null
let pollInterval = null

// Event Listeners
generateBtn.addEventListener('click', handleGenerateTest)

// Load test history on page load
loadTestHistory()

async function handleGenerateTest() {
    const prompt = testPrompt.value.trim()

    if (!prompt) {
        alert('Please enter test instructions')
        return
    }

    // Disable button and show progress
    generateBtn.disabled = true
    generateBtn.innerHTML = '<span class="loading"></span> Processing...'
    progressSection.style.display = 'block'
    resultsSection.style.display = 'none'
    progressSteps.innerHTML = ''

    try {
        // Send request to generate test
        const response = await fetch('/api/generate-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate test')
        }

        currentTestId = data.testId

        // Start polling for progress
        startProgressPolling()
    } catch (error) {
        alert(`Error: ${error.message}`)
        resetUI()
    }
}

function startProgressPolling() {
    // Poll every 1 second
    pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/test-result/${currentTestId}`)
            const data = await response.json()

            updateProgress(data)

            // Stop polling if test is complete
            if (data.status === 'completed' || data.status === 'failed' || data.status === 'error') {
                stopProgressPolling()
                showResults(data)
                loadTestHistory()
                resetUI()
            }
        } catch (error) {
            console.error('Polling error:', error)
        }
    }, 1000)
}

function stopProgressPolling() {
    if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
    }
}

function updateProgress(data) {
    progressSteps.innerHTML = ''

    if (data.steps && data.steps.length > 0) {
        data.steps.forEach(step => {
            const stepEl = document.createElement('div')
            stepEl.className = 'progress-step'

            const statusIcon = getStatusIcon(step.status)
            const statusClass = `status-${step.status}`

            stepEl.innerHTML = `
                <div class="step-status ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                </div>
                <div class="step-name">${step.step}</div>
            `

            progressSteps.appendChild(stepEl)
        })
    } else {
        progressSteps.innerHTML = '<p class="help-text">Initializing...</p>'
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed':
            return '✓'
        case 'failed':
            return '✗'
        case 'running':
            return '●'
        default:
            return '○'
    }
}

function showResults(data) {
    resultsSection.style.display = 'block'

    const success = data.status === 'completed'
    const resultClass = success ? 'result-success' : 'result-failed'
    const resultIcon = success ? '✅' : '❌'
    const resultTitle = success ? 'Test Passed!' : 'Test Failed'

    let html = `
        <div class="result-summary ${resultClass}">
            <div class="result-title">
                <span>${resultIcon}</span>
                <span>${resultTitle}</span>
            </div>
    `

    if (data.testResult && data.testResult.summary) {
        html += `
            <div class="result-stats">
                <div class="stat">
                    <span class="stat-label">Passing</span>
                    <span class="stat-value" style="color: var(--success-color);">
                        ${data.testResult.summary.passing}
                    </span>
                </div>
                <div class="stat">
                    <span class="stat-label">Failing</span>
                    <span class="stat-value" style="color: var(--error-color);">
                        ${data.testResult.summary.failing}
                    </span>
                </div>
            </div>
        `
    }

    html += '</div>'

    // Show validation issues if any
    if (data.validation && data.validation.issues && data.validation.issues.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h3 style="margin-bottom: 0.5rem;">⚠️ Issues Found:</h3>
                <ul style="margin-left: 1.5rem;">
                    ${data.validation.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
        `
    }

    // Show test files generated
    if (data.testDetails && data.testDetails.files) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h3 style="margin-bottom: 0.5rem;">📁 Generated Files:</h3>
                <ul style="margin-left: 1.5rem;">
                    ${data.testDetails.files.map(file => `<li><code>${file}</code></li>`).join('')}
                </ul>
            </div>
        `
    }

    // Show test output
    if (data.testResult && data.testResult.output) {
        html += `
            <div>
                <h3 style="margin-bottom: 0.5rem;">📋 Test Output:</h3>
                <div class="test-output">${escapeHtml(data.testResult.output)}</div>
            </div>
        `
    }

    testResults.innerHTML = html
}

async function loadTestHistory() {
    try {
        const response = await fetch('/api/test-history')
        const history = await response.json()

        if (history.length === 0) {
            testHistory.innerHTML = '<p class="empty-state">No tests run yet. Create your first test above!</p>'
            return
        }

        testHistory.innerHTML = history.map(test => {
            const date = new Date(test.timestamp)
            const timeStr = date.toLocaleString()
            const statusClass = `status-${test.status}`

            return `
                <div class="history-item" onclick="showTestDetails('${test.id}')">
                    <div class="history-header">
                        <span class="history-status ${statusClass}">
                            ${test.status.toUpperCase()}
                        </span>
                        <span class="history-time">${timeStr}</span>
                    </div>
                    <div class="history-prompt">${escapeHtml(test.prompt)}</div>
                </div>
            `
        }).join('')
    } catch (error) {
        console.error('Failed to load history:', error)
    }
}

async function showTestDetails(testId) {
    try {
        const response = await fetch(`/api/test-result/${testId}`)
        const data = await response.json()

        currentTestId = testId
        progressSection.style.display = 'block'
        updateProgress(data)

        if (data.status === 'completed' || data.status === 'failed' || data.status === 'error') {
            showResults(data)
        }

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
        console.error('Failed to load test details:', error)
    }
}

function resetUI() {
    generateBtn.disabled = false
    generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generate & Run Test'
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopProgressPolling()
})
