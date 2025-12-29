// API Key Security - Interactive Logic

function init() {
    // Generator controls
    document.getElementById('keyLength').addEventListener('input', updateLengthDisplay);
    document.getElementById('generateKey').addEventListener('click', generateAPIKey);
    document.getElementById('copyKey')?.addEventListener('click', copyGeneratedKey);

    // Scanner
    document.getElementById('scanCode').addEventListener('click', scanForVulnerabilities);

    console.log('🔑 API Key Security loaded');
}

function updateLengthDisplay(e) {
    document.getElementById('lengthValue').textContent = e.target.value;
}

function generateAPIKey() {
    const length = parseInt(document.getElementById('keyLength').value);
    const prefix = document.getElementById('keyPrefix').value;
    const useLetters = document.getElementById('useLetters').checked;
    const useNumbers = document.getElementById('useNumbers').checked;
    const useSymbols = document.getElementById('useSymbols').checked;

    if (!useLetters && !useNumbers && !useSymbols) {
        showToast('⚠ Select at least one character set');
        return;
    }

    // Build character set
    let charset = '';
    if (useLetters) charset += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*-_=+';

    // Generate key using Web Crypto API
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    let key = '';
    for (let i = 0; i < length; i++) {
        key += charset[array[i] % charset.length];
    }

    const apiKey = prefix + key;

    // Calculate entropy
    const entropy = Math.log2(Math.pow(charset.length, length));

    // Security score
    let score;
    if (entropy > 256) score = '🟢 Excellent';
    else if (entropy > 128) score = '🟡 Good';
    else if (entropy > 64) score = '🟠 Fair';
    else score = '🔴 Weak';

    // Display
    document.getElementById('generatedKey').textContent = apiKey;
    document.getElementById('keyLengthStat').textContent = apiKey.length;
    document.getElementById('entropyStat').textContent = Math.round(entropy);
    document.getElementById('securityScore').textContent = score;
    document.getElementById('generatedKeySection').classList.remove('hidden');

    showToast('✅ API key generated!');
}

function copyGeneratedKey() {
    const key = document.getElementById('generatedKey').textContent;
    copyToClipboard(key);
}

function scanForVulnerabilities() {
    const code = document.getElementById('codeInput').value;

    if (!code.trim()) {
        showToast('⚠ Paste some code to scan');
        return;
    }

    const issues = [];

    // Pattern 1: Hardcoded keys in variables
    const hardcodedPattern = /(api_key|apikey|API_KEY|secret|SECRET|password|PASSWORD)\s*[=:]\s*['"`]([^'"`]{8,})['"`]/gi;
    let match;
    while ((match = hardcodedPattern.exec(code)) !== null) {
        issues.push({
            type: 'Hardcoded API Key',
            line: code.substring(0, match.index).split('\n').length,
            code: match[0],
            severity: 'HIGH',
            fix: 'Use environment variables: process.env.API_KEY'
        });
    }

    // Pattern 2: Keys in URLs
    const urlPattern = /(https?:\/\/[^\s]+[?&](api_key|key|apikey|token)=([^&\s]+))/gi;
    while ((match = urlPattern.exec(code)) !== null) {
        issues.push({
            type: 'API Key in URL',
            line: code.substring(0, match.index).split('\n').length,
            code: match[0],
            severity: 'CRITICAL',
            fix: 'Use Authorization header: {\'Authorization\': \'Bearer \' + apiKey}'
        });
    }

    // Pattern 3: Keys in comments
    const commentPattern = /\/\/.*?(api.?key|secret|password).*?[:=].*?([a-zA-Z0-9]{16,})/gi;
    while ((match = commentPattern.exec(code)) !== null) {
        issues.push({
            type: 'API Key in Comment',
            line: code.substring(0, match.index).split('\n').length,
            code: match[0],
            severity: 'MEDIUM',
            fix: 'Remove keys from comments, use .env.example instead'
        });
    }

    // Pattern 4: Potential keys (long alphanumeric strings)
    const potentialKeyPattern = /['"`]([a-zA-Z0-9_-]{32,})['"`]/g;
    while ((match = potentialKeyPattern.exec(code)) !== null) {
        // Avoid duplicates
        const alreadyFound = issues.some(i => i.code.includes(match[1]));
        if (!alreadyFound && match[1].length > 40) {
            issues.push({
                type: 'Potential API Key',
                line: code.substring(0, match.index).split('\n').length,
                code: match[0],
                severity: 'LOW',
                fix: 'Review if this is a secret. If yes, move to environment variables'
            });
        }
    }

    // Display results
    const resultsSection = document.getElementById('scanResults');
    const issuesList = document.getElementById('issuesList');
    const issuesCount = document.getElementById('issuesCount');

    if (issues.length === 0) {
        issuesCount.textContent = '✅ No issues found';
        issuesCount.style.background = 'rgba(34, 197, 94, 0.2)';
        issuesCount.style.borderColor = 'var(--success-color)';
        issuesList.innerHTML = `
            <div class="no-issues">
                <p>🎉 Great job! No obvious API key vulnerabilities detected.</p>
                <p>However, always review manually and use tools like git-secrets.</p>
            </div>
        `;
    } else {
        issuesCount.textContent = `⚠ ${issues.length} issue${issues.length > 1 ? 's' : ''} found`;
        issuesCount.style.background = 'rgba(239, 68, 68, 0.2)';
        issuesCount.style.borderColor = 'var(--error-color)';

        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-item">
                <h4>${issue.type} (${issue.severity})</h4>
                <p>Line ${issue.line}</p>
                <code>${escapeHtml(issue.code)}</code>
                <p><strong>Fix:</strong> ${issue.fix}</p>
            </div>
        `).join('');
    }

    resultsSection.classList.remove('hidden');
    showToast(`🔍 Scan complete: ${issues.length} issue${issues.length !== 1 ? 's' : ''} found`);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Copied to clipboard!');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Copied to clipboard!');
    });
}

function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
