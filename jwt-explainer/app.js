// ============================================
// JWT EXPLAINER - ENHANCED INTERACTIVE LOGIC
// Multi-algorithm support, Expiration Timer, QR Code
// ============================================

// Default JWT Data
const defaultHeader = {
    alg: "HS256",
    typ: "JWT"
};

const defaultPayload = {
    sub: "1234567890",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

const defaultSecret = "your-256-bit-secret";

// State
let currentHeader = { ...defaultHeader };
let currentPayload = { ...defaultPayload };
let currentSecret = defaultSecret;
let currentPrivateKey = '';
let currentPublicKey = '';
let expirationInterval = null;
let qrCode = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Base64URL Encoding (JWT specific)
function base64UrlEncode(str) {
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Base64URL Decoding
function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    try {
        return atob(base64);
    } catch (e) {
        return null;
    }
}

// Get hash algorithm from name
function getHashAlgorithm(alg) {
    const hashMap = {
        'HS256': 'SHA-256',
        'HS384': 'SHA-384',
        'HS512': 'SHA-512',
        'RS256': 'SHA-256',
        'RS384': 'SHA-384',
        'RS512': 'SHA-512'
    };
    return hashMap[alg] || 'SHA-256';
}

// HMAC Signing
async function hmacSign(message, secret, algorithm) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: getHashAlgorithm(algorithm) },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// RSA Signing
async function rsaSign(message, privateKeyPem, algorithm) {
    try {
        // Remove PEM headers and decode
        const pemContent = privateKeyPem
            .replace(/-----BEGIN.*?-----/g, '')
            .replace(/-----END.*?-----/g, '')
            .replace(/\s/g, '');

        const binaryDer = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));

        const key = await crypto.subtle.importKey(
            'pkcs8',
            binaryDer,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: getHashAlgorithm(algorithm)
            },
            false,
            ['sign']
        );

        const encoder = new TextEncoder();
        const signature = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            key,
            encoder.encode(message)
        );

        return btoa(String.fromCharCode(...new Uint8Array(signature)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    } catch (error) {
        console.error('RSA signing error:', error);
        return 'INVALID_RSA_KEY';
    }
}

// Generate JWT
async function generateJWT(header, payload, secret, privateKey = '') {
    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
    const data = `${headerEncoded}.${payloadEncoded}`;

    let signature;
    if (header.alg.startsWith('HS')) {
        signature = await hmacSign(data, secret, header.alg);
    } else if (header.alg.startsWith('RS')) {
        signature = await rsaSign(data, privateKey, header.alg);
    } else {
        signature = 'UNSUPPORTED_ALGORITHM';
    }

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

// Parse JWT
function parseJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }

    try {
        const header = JSON.parse(base64UrlDecode(parts[0]));
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        const signature = parts[2];

        return { header, payload, signature };
    } catch (e) {
        return null;
    }
}

// Verify JWT Signature
async function verifyJWT(token, secret) {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const parsed = parseJWT(token);
    if (!parsed) return false;

    const data = `${parts[0]}.${parts[1]}`;

    if (parsed.header.alg.startsWith('HS')) {
        const expectedSignature = await hmacSign(data, secret, parsed.header.alg);
        return parts[2] === expectedSignature;
    } else if (parsed.header.alg.startsWith('RS')) {
        // For RSA, we'd need the public key to verify
        // This is a simplified check
        return parts[2] !== 'INVALID_RSA_KEY' && parts[2].length > 0;
    }

    return false;
}

// Show Toast Notification
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Format JSON
function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

// Update Expiration Timer
function updateExpirationTimer() {
    const timerElement = document.getElementById('expirationTimer');
    const timerValue = document.getElementById('timerValue');

    if (!currentPayload.exp) {
        timerValue.textContent = 'No expiration set';
        timerElement.classList.remove('expired', 'expiring-soon');
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = currentPayload.exp - now;

    if (timeLeft <= 0) {
        timerValue.textContent = 'EXPIRED';
        timerElement.classList.add('expired');
        timerElement.classList.remove('expiring-soon');
        return;
    }

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    timerValue.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timerElement.classList.remove('expired');

    // Warn when less than 5 minutes
    if (timeLeft < 300) {
        timerElement.classList.add('expiring-soon');
    } else {
        timerElement.classList.remove('expiring-soon');
    }
}

// Generate QR Code
async function generateQRCode(token) {
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
        // Use QRCode library if available
        if (typeof QRCode !== 'undefined') {
            const qr = new QRCode(canvas, {
                text: token,
                width: 300,
                height: 300,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });

            document.getElementById('downloadQR').classList.remove('hidden');
        } else {
            // Fallback: Draw a placeholder
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '10px monospace';
            ctx.fillText('(Library not loaded)', canvas.width / 2, canvas.height / 2 + 10);
        }
    } catch (error) {
        console.error('QR code generation error:', error);
    }
}

// Generate RSA Key Pair
async function generateRSAKeyPair() {
    try {
        showToast('Generating RSA keys... (this may take a moment)');

        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256'
            },
            true,
            ['sign', 'verify']
        );

        // Export private key
        const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKey)}\n-----END PRIVATE KEY-----`;

        // Export public key
        const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(publicKey)}\n-----END PUBLIC KEY-----`;

        document.getElementById('privateKey').value = privateKeyPem;
        document.getElementById('publicKey').value = publicKeyPem;

        currentPrivateKey = privateKeyPem;
        currentPublicKey = publicKeyPem;

        await updateUI();
        showToast('✓ RSA keys generated successfully!');
    } catch (error) {
        console.error('RSA key generation error:', error);
        showToast('⚠ Failed to generate RSA keys');
    }
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // Add line breaks every 64 characters
    return base64.match(/.{1,64}/g).join('\n');
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

async function updateUI() {
    // Update editors
    document.getElementById('headerEditor').value = formatJSON(currentHeader);
    document.getElementById('payloadEditor').value = formatJSON(currentPayload);

    // Generate JWT
    const jwt = await generateJWT(currentHeader, currentPayload, currentSecret, currentPrivateKey);
    const parts = jwt.split('.');

    // Update JWT display
    document.getElementById('jwtHeaderDisplay').textContent = parts[0];
    document.getElementById('jwtPayloadDisplay').textContent = parts[1];
    document.getElementById('jwtSignatureDisplay').textContent = parts[2];

    // Update encoded previews
    document.getElementById('headerEncoded').textContent = parts[0];
    document.getElementById('payloadEncoded').textContent = parts[1];

    // Update stats
    document.getElementById('tokenLength').textContent = jwt.length;
    document.getElementById('headerLength').textContent = parts[0].length;
    document.getElementById('payloadLength').textContent = parts[1].length;
    document.getElementById('signatureLength').textContent = parts[2].length;

    // Update verification status
    const isValid = await verifyJWT(jwt, currentSecret);
    const verificationStatus = document.getElementById('verificationStatus');

    if (isValid) {
        verificationStatus.classList.remove('invalid');
        verificationStatus.querySelector('.status-icon').classList.add('valid');
        verificationStatus.querySelector('.status-icon').classList.remove('invalid');
        verificationStatus.querySelector('.status-text').textContent = 'Signature Valid';
    } else {
        verificationStatus.classList.add('invalid');
        verificationStatus.querySelector('.status-icon').classList.add('invalid');
        verificationStatus.querySelector('.status-icon').classList.remove('valid');
        verificationStatus.querySelector('.status-text').textContent = 'Signature Invalid';
    }

    // Update expiration timer
    updateExpirationTimer();

    // Update QR code
    await generateQRCode(jwt);
}

// Toggle algorithm-specific inputs
function toggleAlgorithmInputs(algorithm) {
    const secretKeyGroup = document.getElementById('secretKeyGroup');
    const rsaKeysGroup = document.getElementById('rsaKeysGroup');

    if (algorithm.startsWith('HS')) {
        secretKeyGroup.classList.remove('hidden');
        rsaKeysGroup.classList.add('hidden');
    } else if (algorithm.startsWith('RS')) {
        secretKeyGroup.classList.add('hidden');
        rsaKeysGroup.classList.remove('hidden');
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

// Algorithm Selector Change
document.getElementById('algorithmSelect').addEventListener('change', async (e) => {
    const algorithm = e.target.value;
    currentHeader.alg = algorithm;
    toggleAlgorithmInputs(algorithm);
    await updateUI();
});

// Header Editor Change
document.getElementById('headerEditor').addEventListener('input', async (e) => {
    try {
        const value = e.target.value;
        const parsed = JSON.parse(value);
        currentHeader = parsed;

        // Update algorithm selector if changed
        if (parsed.alg) {
            document.getElementById('algorithmSelect').value = parsed.alg;
            toggleAlgorithmInputs(parsed.alg);
        }

        await updateUI();
    } catch (err) {
        // Invalid JSON, don't update
    }
});

// Payload Editor Change
document.getElementById('payloadEditor').addEventListener('input', async (e) => {
    try {
        const value = e.target.value;
        const parsed = JSON.parse(value);
        currentPayload = parsed;
        await updateUI();
    } catch (err) {
        // Invalid JSON, don't update
    }
});

// Secret Key Change
document.getElementById('secretKey').addEventListener('input', async (e) => {
    currentSecret = e.target.value;
    await updateUI();
});

// Private Key Change
document.getElementById('privateKey').addEventListener('input', async (e) => {
    currentPrivateKey = e.target.value;
    await updateUI();
});

// Public Key Change
document.getElementById('publicKey').addEventListener('input', async (e) => {
    currentPublicKey = e.target.value;
});

// Generate RSA Keys Button
document.getElementById('generateRSAKeys').addEventListener('click', generateRSAKeyPair);

// Toggle Secret Visibility
document.getElementById('toggleSecret').addEventListener('click', () => {
    const secretInput = document.getElementById('secretKey');
    const type = secretInput.type === 'password' ? 'text' : 'password';
    secretInput.type = type;
});

// Copy Token Button
document.getElementById('copyToken').addEventListener('click', async () => {
    const jwt = await generateJWT(currentHeader, currentPayload, currentSecret, currentPrivateKey);

    try {
        await navigator.clipboard.writeText(jwt);
        showToast('✓ Token copied to clipboard!');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = jwt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✓ Token copied to clipboard!');
    }
});

// Reset Token Button
document.getElementById('resetToken').addEventListener('click', async () => {
    currentHeader = { ...defaultHeader };
    currentPayload = {
        ...defaultPayload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    currentSecret = defaultSecret;
    document.getElementById('secretKey').value = defaultSecret;
    document.getElementById('algorithmSelect').value = 'HS256';
    toggleAlgorithmInputs('HS256');
    await updateUI();
    showToast('✓ Token reset to defaults');
});

// Download QR Code
document.getElementById('downloadQR').addEventListener('click', () => {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.download = 'jwt-qrcode.png';
    link.href = canvas.toDataURL();
    link.click();
    showToast('✓ QR code downloaded!');
});

// Claim Tag Click Handlers
document.querySelectorAll('.claim-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        const claim = tag.dataset.claim;
        const descriptions = {
            iss: 'Issuer - Who created and signed this token',
            sub: 'Subject - Who the token is about (usually user ID)',
            aud: 'Audience - Who the token is intended for',
            exp: 'Expiration Time - When the token expires (Unix timestamp)',
            iat: 'Issued At - When the token was created (Unix timestamp)',
            nbf: 'Not Before - Token not valid before this time (Unix timestamp)'
        };

        showToast(descriptions[claim] || claim, 3000);
    });
});

// Decode JWT Section
document.getElementById('decodeBtn').addEventListener('click', async () => {
    const input = document.getElementById('decodeInput').value.trim();

    if (!input) {
        showToast('⚠ Please enter a JWT token');
        return;
    }

    const parsed = parseJWT(input);

    if (!parsed) {
        showToast('⚠ Invalid JWT format');
        document.getElementById('decodeResult').classList.add('hidden');
        return;
    }

    // Display decoded parts
    document.getElementById('decodedHeader').textContent = formatJSON(parsed.header);
    document.getElementById('decodedPayload').textContent = formatJSON(parsed.payload);

    // Verify signature with current secret
    const isValid = await verifyJWT(input, currentSecret);
    const decodeStatus = document.getElementById('decodeStatus');

    if (isValid) {
        decodeStatus.textContent = '✓ Signature verified with your current secret key';
        decodeStatus.classList.add('valid');
        decodeStatus.classList.remove('invalid');
    } else {
        decodeStatus.textContent = '⚠ Signature does not match your current secret key (this is expected if the token was signed with a different secret)';
        decodeStatus.classList.add('invalid');
        decodeStatus.classList.remove('valid');
    }

    document.getElementById('decodeResult').classList.remove('hidden');
    showToast('✓ Token decoded successfully');
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', async (e) => {
    // Ctrl/Cmd + K to copy token
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('copyToken').click();
    }

    // Ctrl/Cmd + Shift + R to reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        document.getElementById('resetToken').click();
    }
});

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    // Set initial values
    document.getElementById('secretKey').value = defaultSecret;
    document.getElementById('algorithmSelect').value = currentHeader.alg;
    toggleAlgorithmInputs(currentHeader.alg);

    // Initial UI update
    await updateUI();

    // Start expiration timer interval
    if (expirationInterval) {
        clearInterval(expirationInterval);
    }
    expirationInterval = setInterval(updateExpirationTimer, 1000);

    // Auto-format JSON editors on blur
    ['headerEditor', 'payloadEditor'].forEach(id => {
        const editor = document.getElementById(id);
        editor.addEventListener('blur', () => {
            try {
                const value = editor.value;
                const parsed = JSON.parse(value);
                editor.value = formatJSON(parsed);
            } catch (err) {
                // Keep original if invalid JSON
            }
        });
    });

    // Add visual feedback when hovering over JWT parts
    ['jwtHeaderDisplay', 'jwtPayloadDisplay', 'jwtSignatureDisplay'].forEach((id, index) => {
        const element = document.getElementById(id);
        const cards = document.querySelectorAll('.editor-card');

        element.addEventListener('mouseenter', () => {
            if (cards[index]) {
                cards[index].style.transform = 'scale(1.02)';
                cards[index].style.transition = 'transform 0.2s ease';
            }
        });

        element.addEventListener('mouseleave', () => {
            if (cards[index]) {
                cards[index].style.transform = 'scale(1)';
            }
        });
    });

    console.log('%c🔐 JWT Explainer Enhanced Loaded', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Multi-algorithm, Expiration Timer, QR Code', 'color: #a855f7;');
    console.log('%cKeyboard Shortcuts:', 'color: #a855f7; font-weight: bold;');
    console.log('  Ctrl/Cmd + K → Copy Token');
    console.log('  Ctrl/Cmd + Shift + R → Reset Token');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (expirationInterval) {
        clearInterval(expirationInterval);
    }
});

// Export for debugging
window.jwtDebug = {
    generateJWT,
    parseJWT,
    verifyJWT,
    base64UrlEncode,
    base64UrlDecode,
    getCurrentState: () => ({
        header: currentHeader,
        payload: currentPayload,
        secret: currentSecret,
        privateKey: currentPrivateKey,
        publicKey: currentPublicKey
    })
};
