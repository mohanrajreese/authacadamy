// Auth Decision Tree - Decision Logic & Data

const decisionTree = {
    questions: [
        {
            id: 'q1',
            text: 'What are you building?',
            options: [
                { text: '🌐 Web Application', next: 'q2_web' },
                { text: '📱 Mobile Application', next: 'q2_mobile' },
                { text: '🔌 API / Backend Service', next: 'q2_api' },
                { text: '🤖 Microservices', result: 'microservices' },
                { text: '🏭 IoT / Embedded Device', result: 'iot' }
            ]
        },
        {
            id: 'q2_web',
            text: 'What type of web application?',
            options: [
                { text: '📄 Traditional (Server-rendered)', next: 'q3_traditional' },
                { text: '⚡ Single Page App (React/Vue/Angular)', next: 'q3_spa' },
                { text: '🎨 Static Site with Auth', next: 'q3_static' }
            ]
        },
        {
            id: 'q3_traditional',
            text: 'Is it a monolithic application?',
            options: [
                { text: '✅ Yes, single server', result: 'session' },
                { text: '🌐 No, multiple servers', next: 'q4_multi' }
            ]
        },
        {
            id: 'q4_multi',
            text: 'Do you have shared session storage (Redis)?',
            options: [
                { text: '✅ Yes, we can use Redis/DB', result: 'session_redis' },
                { text: '❌ No, need stateless', result: 'jwt_web' }
            ]
        },
        {
            id: 'q3_spa',
            text: 'Do you need third-party login (Google, GitHub, etc.)?',
            options: [
                { text: '✅ Yes, social login', result: 'oauth_spa' },
                { text: '❌ No, own authentication', result: 'jwt_spa' }
            ]
        },
        {
            id: 'q3_static',
            text: 'Do you want to avoid backend code?',
            options: [
                { text: '✅ Yes, fully serverless', result: 'oauth_jamstack' },
                { text: '❌ No, can use backend', result: 'jwt_spa' }
            ]
        },
        {
            id: 'q2_mobile',
            text: 'What's the primary use case?',
            options: [
                { text: '👤 User authentication', result: 'oauth_pkce_mobile' },
                { text: '🔌 API access only', result: 'api_key_mobile' },
                { text: '🏢 Enterprise SSO', result: 'saml_mobile' }
            ]
        },
        {
            id: 'q2_api',
            text: 'Who will use this API?',
            options: [
                { text: '🌍 Public developers', result: 'api_key' },
                { text: '👥 End users (via apps)', next: 'q3_api_users' },
                { text: '🤖 Other services (M2M)', result: 'client_credentials' }
            ]
        },
        {
            id: 'q3_api_users',
            text: 'How do users authenticate?',
            options: [
                { text: '🔐 Through your app', result: 'jwt_api' },
                { text: '🌐 Third-party OAuth', result: 'oauth_api' }
            ]
        }
    ],

    recommendations: {
        session: {
            name: 'Session-Based Authentication',
            icon: '🍪',
            description: 'Traditional server-side session management with cookies.',
            tools: ['../session-vs-token/index.html'],
            reasoning: [
                'Your monolithic application is perfect for sessions',
                'Server-side state makes session revocation easy',
                'No cross-domain complexity needed',
                'CSRF protection with tokens is straightforward'
            ],
            pros: [
                '✅ Easy immediate session revocation',
                '✅ Can store complex session data',
                '✅ Battle-tested approach',
                '✅ Good security with httpOnly cookies'
            ],
            cons: [
                '❌ Harder to scale horizontally',
                '❌ CSRF vulnerable (needs protection)',
                '❌ Not ideal for mobile apps'
            ],
            code: {
                nodejs: `// Express.js session example
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // Prevent XSS
    maxAge: 86400000,    // 24 hours
    sameSite: 'strict'   // CSRF protection
  }
}));

// Login route
app.post('/login', (req, res) => {
  // Validate credentials
  req.session.userId = user.id;
  req.session.roles = user.roles;
  res.json({ success: true });
});`,
                python: `# Django session example
# settings.py
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'

# views.py
from django.contrib.auth import login

def login_view(request):
    user = authenticate(
        username=request.POST['username'],
        password=request.POST['password']
    )
    if user:
        login(request, user)
        return JsonResponse({'success': True})`,
                go: `// Go session example
import "github.com/gorilla/sessions"

var store = sessions.NewCookieStore([]byte("secret-key"))

func loginHandler(w http.ResponseWriter, r *http.Request) {
    session, _ := store.Get(r, "session-name")
    
    // Validate credentials
    session.Values["user_id"] = user.ID
    session.Values["authenticated"] = true
    session.Options = &sessions.Options{
        MaxAge:   86400,
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteStrictMode,
    }
    session.Save(r, w)
}`
            },
            nextSteps: [
                'Set up Redis for session storage',
                'Implement CSRF token protection',
                'Configure secure cookie settings',
                'Add session timeout logic'
            ]
        },

        jwt_spa: {
            name: 'JWT (JSON Web Tokens)',
            icon: '🎫',
            description: 'Stateless authentication with self-contained tokens.',
            tools: ['../jwt-explainer/index.html'],
            reasoning: [
                'SPAs work perfectly with stateless JWT tokens',
                'No server-side session storage needed',
                'Easy to scale across multiple servers',
                'Works well with mobile and web clients'
            ],
            pros: [
                '✅ Stateless - scales horizontally',
                '✅ Works across domains (CORS friendly)',
                '✅ Mobile-friendly',
                '✅ Self-contained (no DB lookup)'
            ],
            cons: [
                '❌ Hard to revoke before expiration',
                '❌ Token size larger than session ID',
                '❌ XSS vulnerable if stored in localStorage'
            ],
            code: {
                nodejs: `// JWT with Express
const jwt = require('jsonwebtoken');

// Login - issue JWT
app.post('/login', async (req, res) => {
  const user = await validateCredentials(req.body);
  
  const token = jwt.sign(
    { userId: user.id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
  
  // Store in httpOnly cookie (not localStorage!)
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000
  });
  res.json({ success: true });
});

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};`,
                python: `# JWT with FastAPI
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer
import jwt
from datetime import datetime, timedelta

app = FastAPI()
security = HTTPBearer()

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

@app.post('/login')
async def login(credentials: dict):
    user = await validate_credentials(credentials)
    token = create_token(user.id)
    return {'access_token': token, 'token_type': 'bearer'}

def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, 'Token expired')`,
                go: `// JWT with Go
import "github.com/golang-jwt/jwt/v5"

type Claims struct {
    UserID string
    jwt.RegisteredClaims
}

func login(w http.ResponseWriter, r *http.Request) {
    // Validate credentials
    claims := &Claims{
        UserID: user.ID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, _ := token.SignedString([]byte(jwtSecret))
    
    http.SetCookie(w, &http.Cookie{
        Name:     "token",
        Value:    tokenString,
        HttpOnly: true,
        Secure:   true,
        SameSite: http.SameSiteStrictMode,
        MaxAge:   3600,
    })
}`
            },
            nextSteps: [
                'Store JWT in httpOnly cookie (NOT localStorage)',
                'Set short expiration (15min-1hr)',
                'Implement refresh token rotation',
                'Add token validation on every request'
            ]
        },

        oauth_pkce_mobile: {
            name: 'OAuth 2.0 + PKCE',
            icon: '🔐',
            description: 'Authorization Code flow with Proof Key for Code Exchange (PKCE). Mandatory for mobile apps.',
            tools: ['../oauth-visualizer/index.html'],
            reasoning: [
                'PKCE is mandatory for mobile apps (can\'t store client secret)',
                'Prevents authorization code interception',
                'Uses system browser for security',
                'Industry best practice for mobile'
            ],
            pros: [
                '✅ Most secure for mobile',
                '✅ No client secret in app',
                '✅ System browser = better security',
                '✅ Refresh token support'
            ],
            cons: [
                '❌ More complex than simple API key',
                '❌ Requires deep linking setup',
                '❌ User leaves app briefly'
            ],
            code: {
                nodejs: `// Express backend for OAuth + PKCE
const crypto = require('crypto');

// Store PKCE challenges temporarily (Redis recommended)
const challenges = new Map();

app.get('/authorize', (req, res) => {
  const { code_challenge, code_challenge_method } = req.query;
  
  // Store challenge
  const authCode = crypto.randomBytes(32).toString('hex');
  challenges.set(authCode, {
    challenge: code_challenge,
    method: code_challenge_method,
    userId: req.session.userId
  });
  
  // Redirect back to app with code
  res.redirect(\`myapp://callback?code=\${authCode}\`);
});

app.post('/token', (req, res) => {
  const { code, code_verifier } = req.body;
  const stored = challenges.get(code);
  
  // Verify PKCE
  const hash = crypto.createHash('sha256')
    .update(code_verifier)
    .digest('base64url');
    
  if (hash !== stored.challenge) {
    return res.status(400).json({ error: 'Invalid verifier' });
  }
  
  // Issue tokens
  const accessToken = createJWT(stored.userId);
  const refreshToken = createRefreshToken(stored.userId);
  
  res.json({ access_token: accessToken, refresh_token: refreshToken });
});`,
                python: `# Mobile OAuth + PKCE with FastAPI
import hashlib
import secrets
import base64

challenges = {}  # Use Redis in production

@app.get('/authorize')
async def authorize(
    code_challenge: str,
    code_challenge_method: str,
    user_id: str = Depends(get_current_user)
):
    auth_code = secrets.token_urlsafe(32)
    challenges[auth_code] = {
        'challenge': code_challenge,
        'method': code_challenge_method,
        'user_id': user_id
    }
    return RedirectResponse(f'myapp://callback?code={auth_code}')

@app.post('/token')
async def token(code: str, code_verifier: str):
    stored = challenges.get(code)
    if not stored:
        raise HTTPException(400, 'Invalid code')
    
    # Verify PKCE
    digest = hashlib.sha256(code_verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).decode().rstrip('=')
    
    if challenge != stored['challenge']:
        raise HTTPException(400, 'Invalid verifier')
    
    access_token = create_jwt(stored['user_id'])
    return {'access_token': access_token, 'token_type': 'bearer'}`,
                go: `// Mobile OAuth + PKCE in Go
import (
    "crypto/sha256"
    "encoding/base64"
)

func authorizeHandler(w http.ResponseWriter, r *http.Request) {
    codeChallenge := r.URL.Query().Get("code_challenge")
    
    authCode := generateRandomString(32)
    challenges[authCode] = Challenge{
        Challenge: codeChallenge,
        UserID:    session.UserID,
    }
    
    http.Redirect(w, r, "myapp://callback?code="+authCode, 302)
}

func tokenHandler(w http.ResponseWriter, r *http.Request) {
    code := r.FormValue("code")
    verifier := r.FormValue("code_verifier")
    
    stored := challenges[code]
    
    // Verify PKCE
    h := sha256.Sum256([]byte(verifier))
    challenge := base64.RawURLEncoding.EncodeToString(h[:])
    
    if challenge != stored.Challenge {
        http.Error(w, "Invalid verifier", 400)
        return
    }
    
    accessToken := createJWT(stored.UserID)
    json.NewEncoder(w).Encode(map[string]string{
        "access_token": accessToken,
    })
}`
            },
            nextSteps: [
                'Configure deep linking (myapp://)',
                'Implement PKCE challenge generation',
                'Use system browser (not WebView)',
                'Store refresh tokens securely (Keychain/Keystore)'
            ]
        },

        api_key: {
            name: 'API Keys',
            icon: '🔑',
            description: 'Simple authentication with unique keys for each developer/application.',
            tools: ['../api-key-security/index.html'],
            reasoning: [
                'Public APIs benefit from simple, widely-understood auth',
                'Easy for developers to get started',
                'Good for rate limiting and usage tracking',
                'Industry standard (Stripe, Twilio, etc.)'
            ],
            pros: [
                '✅ Extremely simple to implement',
                '✅ Easy for developers to use',
                '✅ Good for rate limiting',
                '✅ Easy to revoke/rotate'
            ],
            cons: [
                '❌ Can leak in logs/URLs',
                '❌ No fine-grained permissions',
                '❌ Hard to scope per-user'
            ],
            code: {
                nodejs: `// API Key authentication
const crypto = require('crypto');

// Generate API key
function generateAPIKey() {
  return 'sk_live_' + crypto.randomBytes(32).toString('hex');
}

// Middleware
const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Check in database
  const key = await db.apiKeys.findOne({ key: apiKey, active: true });
  
  if (!key) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Rate limiting
  const usage = await checkRateLimit(key.id);
  if (usage.exceeded) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  req.apiKey = key;
  next();
};

app.get('/api/data', apiKeyAuth, (req, res) => {
  res.json({ data: 'Protected data' });
});`,
                python: `# API Key authentication with FastAPI
from fastapi import Header, HTTPException, Depends
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    # Check database
    key_data = await db.api_keys.find_one({
        'key': api_key,
        'active': True
    })
    
    if not key_data:
        raise HTTPException(401, 'Invalid API key')
    
    # Check rate limit
    usage = await check_rate_limit(key_data['id'])
    if usage['exceeded']:
        raise HTTPException(429, 'Rate limit exceeded')
    
    return key_data

@app.get('/api/data')
async def get_data(key: dict = Depends(verify_api_key)):
    return {'data': 'Protected data', 'owner': key['owner_id']}`,
                go: `// API Key auth in Go
func apiKeyMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        apiKey := r.Header.Get("X-API-Key")
        
        if apiKey == "" {
            http.Error(w, "API key required", 401)
            return
        }
        
        // Check database
        key, err := db.GetAPIKey(apiKey)
        if err != nil || !key.Active {
            http.Error(w, "Invalid API key", 401)
            return
        }
        
        // Rate limiting
        if exceeded := checkRateLimit(key.ID); exceeded {
            http.Error(w, "Rate limit exceeded", 429)
            return
        }
        
        ctx := context.WithValue(r.Context(), "apiKey", key)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}`
            },
            nextSteps: [
                'Generate cryptographically secure keys',
                'Implement rate limiting per key',
                'Add usage analytics dashboard',
                'Support key rotation without downtime'
            ]
        },

        microservices: {
            name: 'JWT + mTLS (Service Mesh)',
            icon: '🤖',
            description: 'Combination of JWT for user context and mTLS for service-to-service security.',
            tools: ['../jwt-explainer/index.html'],
            reasoning: [
                'Microservices need both user context (JWT) and service auth (mTLS)',
                'Service mesh provides mTLS automatically',
                'JWT carries user identity across services',
                'Zero-trust architecture'
            ],
            pros: [
                '✅ Strong service-to-service security',
                '✅ User context propagated via JWT',
                '✅ Service mesh handles complexity',
                '✅ Zero-trust ready'
            ],
            cons: [
                '❌ Complex setup',
                '❌ Certificate management overhead',
                '❌ Service mesh learning curve'
            ],
            code: {
                nodejs: `// Service with JWT + mTLS
// Using Istio service mesh

// JWT validation middleware
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  next();
});

// Call another service (mTLS handled by Istio)
async function callUserService(userId) {
  const response = await fetch('http://user-service/users/' + userId, {
    headers: {
      'Authorization': \`Bearer \${req.user.token}\`
    }
  });
  return response.json();
}`,
                python: `# Microservice with JWT + mTLS (Istio)
from fastapi import FastAPI, Header, HTTPException
import httpx
import jwt

app = FastAPI()

async def verify_jwt(authorization: str = Header(None)):
    if not authorization:
        return None
    
    token = authorization.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(401, 'Invalid token')

@app.get('/data')
async def get_data(user: dict = Depends(verify_jwt)):
    # mTLS handled by Istio
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'http://user-service/users/' + user['sub'],
            headers={'Authorization': f'Bearer {user["token"]}'}
        )
    return response.json()`,
                go: `// Microservice with JWT + mTLS
import (
    "github.com/golang-jwt/jwt/v5"
    "net/http"
)

func jwtMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tokenString := r.Header.Get("Authorization")
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return []byte(jwtSecret), nil
        })
        
        if err != nil || !token.Valid {
            http.Error(w, "Invalid token", 401)
            return
        }
        
        ctx := context.WithValue(r.Context(), "user", token.Claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// mTLS handled by Istio service mesh`
            },
            nextSteps: [
                'Deploy service mesh (Istio, Linkerd)',
                'Configure mTLS policies',
                'Propagate JWT across services',
                'Implement distributed tracing'
            ]
        }
    }
};

// Export for app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = decisionTree;
}
