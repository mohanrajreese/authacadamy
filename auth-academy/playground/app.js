// Auth Playground - Interactive Testing Environment

let currentAlgorithm = 'SHA-256';

function init() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // JWT Generator
    document.getElementById('jwtHeader').addEventListener('input', generateJWT);
    document.getElementById('jwtPayload').addEventListener('input', generateJWT);
    document.getElementById('jwtSecret').addEventListener('input', generateJWT);
    document.getElementById('randomSecret').addEventListener('click', randomSecret);
    document.getElementById('copyJwt').addEventListener('click', copyJWT);

    // Quick claims
    document.querySelectorAll('.claim-btn').forEach(btn => {
        btn.addEventListener('click', () => addClaim(btn.dataset.claim));
    });

    // API Tester
    document.querySelectorAll('input[name="authType"]').forEach(radio => {
        radio.addEventListener('change', switchAuthType);
    });
    document.getElementById('sendRequest').addEventListener('click', sendApiRequest);
    document.getElementById('addHeader').addEventListener('click', addHeaderRow);

    // Hash Calculator
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAlgorithm = btn.dataset.algo;
            calculateHash();
        });
    });
    document.getElementById('hashInput').addEventListener('input', calculateHash);

    // Base64 Encoder
    document.getElementById('encodeBtn').addEventListener('click', encodeBase64);
    document.getElementById('decodeBtn').addEventListener('click', decodeBase64);

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const text = document.getElementById(targetId).textContent;
            copyToClipboard(text);
        });
    });

    // Initial generation
    generateJWT();
    calculateHash();

    console.log('🎮 Auth Playground loaded');
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.playground-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== `${tabName}-panel`);
    });
}

// JWT Generator
async function generateJWT() {
    try {
        const headerText = document.getElementById('jwtHeader').value;
        const payloadText = document.getElementById('jwtPayload').value;
        const secret = document.getElementById('jwtSecret').value;

        // Parse JSON
        const header = JSON.parse(headerText);
        const payload = JSON.parse(payloadText);

        // Encode header and payload
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(payload));

        // Create signature
        const data = `${encodedHeader}.${encodedPayload}`;
        const signature = await createHmacSignature(data, secret, header.alg || 'HS256');

        // Display
        document.getElementById('genHeader').textContent = encodedHeader;
        document.getElementById('genPayload').textContent = encodedPayload;
        document.getElementById('genSignature').textContent = signature;

    } catch (e) {
        // Invalid JSON, show error state
        document.getElementById('genSignature').textContent = '❌ Invalid JSON';
    }
}

async function createHmacSignature(data, secret, algorithm) {
    const algMap = {
        'HS256': 'SHA-256',
        'HS384': 'SHA-384',
        'HS512': 'SHA-512'
    };

    const hashAlg = algMap[algorithm] || 'SHA-256';

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataBytes = encoder.encode(data);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: hashAlg },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, dataBytes);
    return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

function base64UrlEncode(str) {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(escape(atob(str)));
}

function randomSecret() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('jwtSecret').value = secret;
    generateJWT();
    showToast('🎲 Random secret generated!');
}

function addClaim(claimType) {
    try {
        const payloadEl = document.getElementById('jwtPayload');
        const payload = JSON.parse(payloadEl.value);

        const now = Math.floor(Date.now() / 1000);

        switch (claimType) {
            case 'iat':
                payload.iat = now;
                break;
            case 'exp':
                payload.exp = now + 3600; // 1 hour
                break;
            case 'jti':
                payload.jti = crypto.randomUUID();
                break;
        }

        payloadEl.value = JSON.stringify(payload, null, 2);
        generateJWT();
        showToast(`✅ Added ${claimType} claim`);
    } catch (e) {
        showToast('❌ Invalid payload JSON');
    }
}

function copyJWT() {
    const header = document.getElementById('genHeader').textContent;
    const payload = document.getElementById('genPayload').textContent;
    const signature = document.getElementById('genSignature').textContent;
    const jwt = `${header}.${payload}.${signature}`;
    copyToClipboard(jwt);
}

// API Tester
function switchAuthType() {
    const authType = document.querySelector('input[name="authType"]:checked').value;

    document.getElementById('bearerInput').classList.toggle('hidden', authType !== 'bearer');
    document.getElementById('apikeyInput').classList.toggle('hidden', authType !== 'apikey');
    document.getElementById('basicInput').classList.toggle('hidden', authType !== 'basic');
}

function addHeaderRow() {
    const container = document.getElementById('customHeaders');
    const row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = `
        <input type="text" placeholder="Header name" class="header-name">
        <input type="text" placeholder="Header value" class="header-value">
        <button class="remove-header">×</button>
    `;
    row.querySelector('.remove-header').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

async function sendApiRequest() {
    const method = document.getElementById('httpMethod').value;
    const url = document.getElementById('apiUrl').value;
    const authType = document.querySelector('input[name="authType"]:checked').value;

    const headers = {};

    // Add auth header
    switch (authType) {
        case 'bearer':
            const token = document.getElementById('bearerToken').value;
            if (token) headers['Authorization'] = `Bearer ${token}`;
            break;
        case 'apikey':
            const headerName = document.getElementById('apiKeyHeader').value;
            const keyValue = document.getElementById('apiKeyValue').value;
            if (headerName && keyValue) headers[headerName] = keyValue;
            break;
        case 'basic':
            const user = document.getElementById('basicUser').value;
            const pass = document.getElementById('basicPass').value;
            if (user) headers['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
            break;
    }

    // Add custom headers
    document.querySelectorAll('.header-row').forEach(row => {
        const name = row.querySelector('.header-name').value;
        const value = row.querySelector('.header-value').value;
        if (name && value) headers[name] = value;
    });

    const startTime = Date.now();

    try {
        const response = await fetch(url, {
            method,
            headers,
            mode: 'cors'
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        const responseEl = document.getElementById('apiResponse');
        responseEl.classList.remove('hidden');

        const statusBadge = document.getElementById('responseStatus');
        statusBadge.textContent = `${response.status} ${response.statusText}`;
        statusBadge.className = `status-badge ${response.ok ? 'success' : 'error'}`;

        document.getElementById('responseTime').textContent = `${duration}ms`;

        const body = await response.text();
        try {
            const json = JSON.parse(body);
            document.getElementById('responseBody').textContent = JSON.stringify(json, null, 2);
        } catch {
            document.getElementById('responseBody').textContent = body;
        }

        showToast(`✅ Request completed: ${response.status}`);

    } catch (error) {
        const responseEl = document.getElementById('apiResponse');
        responseEl.classList.remove('hidden');

        document.getElementById('responseStatus').textContent = 'Error';
        document.getElementById('responseStatus').className = 'status-badge error';
        document.getElementById('responseTime').textContent = '';
        document.getElementById('responseBody').textContent = error.message;

        showToast('❌ Request failed');
    }
}

// Hash Calculator
async function calculateHash() {
    const input = document.getElementById('hashInput').value;

    if (!input) {
        document.getElementById('hashHex').textContent = '';
        document.getElementById('hashBase64').textContent = '';
        document.getElementById('hashBase64Url').textContent = '';
        return;
    }

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest(currentAlgorithm, data);
        const hashArray = new Uint8Array(hashBuffer);

        // Hex
        const hex = Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');
        document.getElementById('hashHex').textContent = hex;

        // Base64
        const base64 = btoa(String.fromCharCode(...hashArray));
        document.getElementById('hashBase64').textContent = base64;

        // Base64URL
        const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        document.getElementById('hashBase64Url').textContent = base64url;

    } catch (error) {
        console.error('Hash error:', error);
    }
}

// Base64 Encoder/Decoder
function encodeBase64() {
    const input = document.getElementById('plainText').value;
    const isBase64Url = document.querySelector('input[name="encodingType"]:checked').value === 'base64url';

    try {
        let encoded = btoa(unescape(encodeURIComponent(input)));

        if (isBase64Url) {
            encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }

        document.getElementById('encodedText').value = encoded;
        showToast('✅ Encoded!');
    } catch (e) {
        showToast('❌ Encoding failed');
    }
}

function decodeBase64() {
    let input = document.getElementById('encodedText').value;
    const isBase64Url = document.querySelector('input[name="encodingType"]:checked').value === 'base64url';

    try {
        if (isBase64Url) {
            input = input.replace(/-/g, '+').replace(/_/g, '/');
            while (input.length % 4) input += '=';
        }

        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('plainText').value = decoded;
        showToast('✅ Decoded!');
    } catch (e) {
        showToast('❌ Invalid Base64');
    }
}

// Utilities
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
        showToast('✅ Copied!');
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

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
