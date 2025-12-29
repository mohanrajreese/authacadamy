// OAuth 2.0 Visualizer - Interactive Logic
// Flow animations, PKCE generator, token inspector

// Flow definitions
const flows = {
    'authorization-code': {
        title: 'Authorization Code Flow',
        steps: [
            {
                title: 'User initiates login',
                text: 'User clicks "Login" button in your application.',
                from: 'user',
                to: 'app',
                code: ''
            },
            {
                title: 'App redirects to Authorization Server',
                text: 'Your app redirects user to the OAuth provider with client_id, redirect_uri, scope, and state.',
                from: 'app',
                to: 'auth',
                code: `GET /authorize?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=read:user read:email
  &state=random_csrf_token

HTTP/1.1\nHost: auth.provider.com`
            },
            {
                title: 'User authenticates',
                text: 'User logs in at the Authorization Server and approves the requested permissions.',
                from: 'auth',
                to: 'user',
                code: ''
            },
            {
                title: 'Authorization Code returned',
                text: 'Auth server redirects back to your app with an authorization code.',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 302 Found
Location: https://yourapp.com/callback?
  code=AUTH_CODE_HERE
  &state=random_csrf_token`
            },
            {
                title: 'Exchange code for tokens',
                text: 'Your app exchanges the authorization code for access and refresh tokens.',
                from: 'app',
                to: 'auth',
                code: `POST /token HTTP/1.1
Host: auth.provider.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_HERE
&redirect_uri=https://yourapp.com/callback
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET`
            },
            {
                title: 'Tokens issued',
                text: 'Authorization server returns access token and refresh token.',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOk...",
  "scope": "read:user read:email"
}`
            },
            {
                title: 'Access protected resource',
                text: 'Your app uses the access token to call the API on behalf of the user.',
                from: 'app',
                to: 'api',
                code: `GET /api/user HTTP/1.1
Host: api.provider.com
Authorization: Bearer eyJhbGci...`
            },
            {
                title: 'Resource returned',
                text: 'API validates the token and returns the requested data.',
                from: 'api',
                to: 'app',
                code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "12345",
  "name": "John Doe",
  "email": "john@example.com"
}`
            }
        ]
    },
    'pkce': {
        title: 'Authorization Code + PKCE Flow',
        steps: [
            {
                title: 'Generate PKCE values',
                text: 'App generates code_verifier (random) and code_challenge (SHA-256 hash of verifier).',
                from: 'app',
                to: 'app',
                code: `// Client-side (JavaScript)
const codeVerifier = generateRandomString(128);
const codeChallenge = base64UrlEncode(
  await sha256(codeVerifier)
);

// Store verifier securely`
            },
            {
                title: 'Redirect with code_challenge',
                text: 'App redirects to auth server with code_challenge (NOT verifier).',
                from: 'app',
                to: 'auth',
                code: `GET /authorize?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=read:user
  &state=random_csrf_token
  &code_challenge=CHALLENGE_HERE
  &code_challenge_method=S256

HTTP/1.1\nHost: auth.provider.com`
            },
            {
                title: 'User authenticates',
                text: 'User logs in and approves permissions at the Authorization Server.',
                from: 'auth',
                to: 'user',
                code: ''
            },
            {
                title: 'Authorization Code returned',
                text: 'Auth server stores code_challenge and returns authorization code.',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 302 Found
Location: https://yourapp.com/callback?
  code=AUTH_CODE_HERE
  &state=random_csrf_token`
            },
            {
                title: 'Exchange code + verifier for tokens',
                text: 'App sends authorization code AND code_verifier. NO client_secret needed!',
                from: 'app',
                to: 'auth',
                code: `POST /token HTTP/1.1
Host: auth.provider.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_HERE
&redirect_uri=https://yourapp.com/callback
&client_id=YOUR_CLIENT_ID
&code_verifier=VERIFIER_HERE`
            },
            {
                title: 'Server verifies PKCE',
                text: 'Server hashes verifier, compares to stored challenge. If match, issues tokens.',
                from: 'auth',
                to: 'auth',
                code: `// Server validation
const receivedChallenge = base64UrlEncode(
  sha256(code_verifier)
);

if (receivedChallenge === stored_challenge) {
  // Issue tokens
} else {
  // Reject - potential attack!
}`
            },
            {
                title: 'Tokens issued',
                text: 'Authorization server returns access token and refresh token.',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOk..."
}`
            },
            {
                title: 'Access API',
                text: 'App uses access token to call protected APIs.',
                from: 'app',
                to: 'api',
                code: `GET /api/user HTTP/1.1
Host: api.provider.com
Authorization: Bearer eyJhbGci...`
            }
        ]
    },
    'client-credentials': {
        title: 'Client Credentials Flow',
        steps: [
            {
                title: 'Service authenticates',
                text: 'Backend service sends client_id and client_secret to get access token. No user involved!',
                from: 'app',
                to: 'auth',
                code: `POST /token HTTP/1.1
Host: auth.provider.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=read:data write:data`
            },
            {
                title: 'Access token issued',
                text: 'Auth server validates credentials and returns access token (no refresh token in this flow).',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:data write:data"
}`
            },
            {
                title: 'Access API',
                text: 'Service uses access token to call API with service-level permissions.',
                from: 'app',
                to: 'api',
                code: `GET /api/data HTTP/1.1
Host: api.provider.com
Authorization: Bearer eyJhbGci...`
            },
            {
                title: 'Resource returned',
                text: 'API validates token and returns data.',
                from: 'api',
                to: 'app',
                code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [...]
}`
            }
        ]
    },
    'implicit': {
        title: 'Implicit Flow (DEPRECATED)',
        steps: [
            {
                title: 'App redirects to auth server',
                text: 'App requests tokens directly (no authorization code step).',
                from: 'app',
                to: 'auth',
                code: `GET /authorize?
  response_type=token
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=read:user
  &state=random_csrf_token

HTTP/1.1\nHost: auth.provider.com`
            },
            {
                title: 'User authenticates',
                text: 'User logs in at authorization server.',
                from: 'auth',
                to: 'user',
                code: ''
            },
            {
                title: 'Access token in URL fragment',
                text: 'Tokens returned directly in URL fragment. Insecure! Visible in browser history, logs.',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 302 Found
Location: https://yourapp.com/callback#
  access_token=eyJhbGci...
  &token_type=Bearer
  &expires_in=3600
  &state=random_csrf_token

⚠️ SECURITY ISSUE: Token exposed in URL!`
            },
            {
                title: '⚠️ Why deprecated?',
                text: 'Tokens in URL fragment can leak via browser history, referrer headers, and are vulnerable to XSS. Use Authorization Code + PKCE instead!',
                from: 'app',
                to: 'app',
                code: `// DON'T USE THIS FLOW!
// Reasons:
// - No refresh tokens
// - Tokens in URL (insecure)
// - No client authentication
// - Vulnerable to token theft

// Use: Authorization Code + PKCE`
            }
        ]
    },
    'password': {
        title: 'Resource Owner Password Flow (DEPRECATED)',
        steps: [
            {
                title: 'User provides credentials to app',
                text: 'User enters username and password directly into your application. Defeats the purpose of OAuth!',
                from: 'user',
                to: 'app',
                code: `// User types credentials into YOUR app
// This is what OAuth was designed to AVOID!`
            },
            {
                title: 'App sends credentials to auth server',
                text: 'Your app sends user credentials to the authorization server.',
                from: 'app',
                to: 'auth',
                code: `POST /token HTTP/1.1
Host: auth.provider.com
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=user@example.com
&password=users_password
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=read:user`
            },
            {
                title: 'Tokens issued',
                text: 'If credentials are valid, tokens are returned.',
                from: 'auth',
                to: 'app',
                code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOk..."
}`
            },
            {
                title: '⚠️ Why deprecated?',
                text: 'This flow requires users to share passwords with your app. Use Authorization Code + PKCE or social login instead!',
                from: 'app',
                to: 'app',
                code: `// DON'T USE THIS FLOW!
// Problems:
// - User shares password with your app
// - Defeats OAuth's purpose (delegated access)
// - Password visible to your application
// - No way to limit permissions
// - Trust issues

// Use: Authorization Code + PKCE`
            }
        ]
    }
};

// State
let currentFlow = 'authorization-code';
let currentStepIndex = 0;
let isAnimating = false;

// Initialize
function init() {
    setupFlowSelector();
    setupPlayButton();
    setupResetButton();
    setupPKCEGenerator();
    setupTokenInspector();
    setupScopeBuilder();
    resetVisualization();
}

// Flow Selector
function setupFlowSelector() {
    document.querySelectorAll('.flow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const flowId = btn.dataset.flow;
            selectFlow(flowId);
        });
    });
}

function selectFlow(flowId) {
    currentFlow = flowId;

    // Update active button
    document.querySelectorAll('.flow-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.flow === flowId);
    });

    // Reset visualization
    resetVisualization();
}

// Play Button
function setupPlayButton() {
    document.getElementById('playBtn').addEventListener('click', () => {
        if (!isAnimating) {
            playAnimation();
        }
    });
}

// Reset Button
function setupResetButton() {
    document.getElementById('resetBtn').addEventListener('click', resetVisualization);
}

function resetVisualization() {
    isAnimating = false;
    currentStepIndex = 0;

    // Update title
    document.getElementById('flowTitle').textContent = flows[currentFlow].title;

    // Reset actors
    document.querySelectorAll('.actor').forEach(actor => {
        actor.classList.remove('active');
    });

    // Clear arrows
    document.getElementById('flowArrows').innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
            </marker>
        </defs>
    `;

    // Update step description
    const totalSteps = flows[currentFlow].steps.length;
    document.getElementById('currentStep').textContent = '0';
    document.getElementById('totalSteps').textContent = totalSteps;
    document.getElementById('stepTitle').textContent = 'Ready to begin';
    document.getElementById('stepText').textContent = 'Click "Play Animation" to see the OAuth flow in action!';
    document.getElementById('stepCode').classList.add('hidden');
}

async function playAnimation() {
    isAnimating = true;
    const steps = flows[currentFlow].steps;

    for (let i = 0; i < steps.length; i++) {
        currentStepIndex = i;
        await animateStep(steps[i], i + 1);
        await sleep(2000); // Pause between steps
    }

    isAnimating = false;
    showToast('✓ Flow animation complete!');
}

async function animateStep(step, stepNumber) {
    const totalSteps = flows[currentFlow].steps.length;

    // Update step description
    document.getElementById('currentStep').textContent = stepNumber;
    document.getElementById('stepTitle').textContent = step.title;
    document.getElementById('stepText').textContent = step.text;

    if (step.code) {
        document.getElementById('stepCode').classList.remove('hidden');
        document.getElementById('stepCodeContent').textContent = step.code;
    } else {
        document.getElementById('stepCode').classList.add('hidden');
    }

    // Highlight actors
    document.querySelectorAll('.actor').forEach(actor => {
        actor.classList.remove('active');
    });

    const fromActor = document.getElementById(step.from + 'Actor');
    const toActor = document.getElementById(step.to + 'Actor');

    if (fromActor) fromActor.classList.add('active');
    if (toActor && step.from !== step.to) toActor.classList.add('active');

    // Draw arrow
    if (fromActor && toActor && step.from !== step.to) {
        drawArrow(fromActor, toActor);
    }
}

function drawArrow(from, to) {
    const svg = document.getElementById('flowArrows');
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - svgRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - svgRect.top;
    const x2 = toRect.left + toRect.width / 2 - svgRect.left;
    const y2 = toRect.top + toRect.height / 2 - svgRect.top;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${x1} ${y1} L ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'flow-arrow active');
    path.setAttribute('marker-end', 'url(#arrowhead)');

    svg.appendChild(path);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// PKCE Generator
function setupPKCEGenerator() {
    document.getElementById('generatePKCE').addEventListener('click', generatePKCE);
}

async function generatePKCE() {
    // Generate code verifier (random string, 43-128 chars)
    const array = new Uint8Array(96);
    crypto.getRandomValues(array);
    const codeVerifier = base64UrlEncode(array);

    // Generate code challenge (SHA-256 of verifier)
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = base64UrlEncode(new Uint8Array(hashBuffer));

    // Display results
    document.getElementById('codeVerifier').textContent = codeVerifier;
    document.getElementById('codeChallenge').textContent = codeChallenge;
    document.getElementById('pkceOutput').classList.remove('hidden');

    showToast('✓ PKCE pair generated!');
}

function base64UrlEncode(arrayBuffer) {
    const bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Copy buttons
document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.copy;
        const text = document.getElementById(targetId).textContent;
        copyToClipboard(text);
    });
});

document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('stepCodeContent').textContent;
    copyToClipboard(code);
});

// Token Inspector
function setupTokenInspector() {
    document.getElementById('inspectToken').addEventListener('click', inspectToken);
}

function inspectToken() {
    const token = document.getElementById('tokenInput').value.trim();

    if (!token) {
        showToast('⚠ Please enter a token');
        return;
    }

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        document.getElementById('tokenHeader').textContent = JSON.stringify(header, null, 2);
        document.getElementById('tokenPayload').textContent = JSON.stringify(payload, null, 2);
        document.getElementById('tokenType').textContent = header.typ || 'JWT';
        document.getElementById('tokenAlgo').textContent = header.alg || 'Unknown';

        if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            const now = new Date();
            const expired = expiryDate < now;
            document.getElementById('tokenExpiry').innerHTML = `Expiry: <strong style="color: ${expired ? 'var(--error-color)' : 'var(--success-color)'}">
                ${expiryDate.toLocaleString()} ${expired ? '(EXPIRED)' : '(Valid)'}
            </strong>`;
        } else {
            document.getElementById('tokenExpiry').textContent = 'Expiry: Not set';
        }

        document.getElementById('tokenOutput').classList.remove('hidden');
        showToast('✓ Token decoded successfully!');
    } catch (error) {
        showToast('⚠ Invalid token format');
        document.getElementById('tokenOutput').classList.add('hidden');
    }
}

// Scope Builder
function setupScopeBuilder() {
    const checkboxes = document.querySelectorAll('.scope-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateScopeParam);
    });
}

function updateScopeParam() {
    const checked = Array.from(document.querySelectorAll('.scope-checkbox:checked'));
    const scopes = checked.map(cb => cb.value);
    const scopeParam = scopes.join(' ') || '(none selected)';
    document.getElementById('scopeParam').textContent = scopeParam;
}

function copyScope() {
    const scopeParam = document.getElementById('scopeParam').textContent;
    if (scopeParam !== '(none selected)') {
        copyToClipboard(scopeParam);
    } else {
        showToast('⚠ No scopes selected');
    }
}

// Utility Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✓ Copied to clipboard!');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✓ Copied to clipboard!');
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

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('%c🔐 OAuth 2.0 Visualizer Loaded', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cExplore OAuth flows interactively!', 'color: #a855f7;');
