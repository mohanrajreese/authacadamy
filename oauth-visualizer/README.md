# 🔐 OAuth 2.0 Visualizer

An **interactive, animated OAuth 2.0 flow explorer** that makes understanding authorization flows accessible to everyone.

## ✨ Features

### 🎬 Interactive Flow Animations

- **5 OAuth Grant Types** with step-by-step visualization:
  - ✅ **Authorization Code** (Recommended)
  - ✅ **PKCE** (Modern Standard for SPAs/Mobile)
  - ✅ **Client Credentials** (Machine-to-Machine)
  - ⚠️ **Implicit Flow** (Deprecated - with warnings)
  - ⚠️ **Password Grant** (Deprecated - with warnings)

- **Animated Actor Diagram** showing:
  - User
  - Your Application
  - Authorization Server
  - Resource API

- **Step-by-Step Explanations** with:
  - Plain English descriptions
  - HTTP request/response examples
  - Security best practices

### 🔧 IntInteractive Tools

#### 1. PKCE Challenge Generator

- Generate cryptographically secure code_verifier
- Calculate SHA-256 code_challenge
- One-click copy for integration
- Learn how PKCE prevents attacks

#### 2. Token Inspector

- Decode JWT access tokens
- View header and payload
- Check expiration status
- Understand token structure

#### 3. Scope Builder

- Interactive scope selector
- Build scope parameters
- Understand permission levels
- Copy-ready for API requests

### 🛡️ Security Guidance

- ✅ DO: Best practices for each flow
- ❌ DON'T: Common mistakes to avoid
- Security ratings for each grant type
- Modern vs deprecated flow warnings

### 📊 Comparison Tools

- Grant type comparison table
- Use case matcher
- Security level indicators
- Recommended flows highlighted

## 🚀 Quick Start

Simply open `index.html` in your browser - no build process required!

```bash
# Option 1: Direct open
open index.html

# Option 2: Local server
python3 -m http.server 8000
# Visit: http://localhost:8000
```

## 🎯 What You'll Learn

1. **OAuth 2.0 Fundamentals**
   - Authorization vs Authentication
   - Token-based access
   - Secure delegation

2. **Grant Types Deep Dive**
   - When to use each flow
   - Security implications
   - Modern best practices

3. **PKCE (Proof Key for Code Exchange)**
   - Why it's mandatory for mobile/SPA
   - How it works
   - Implementation details

4. **OAuth Security**
   - CSRF protection with state
   - Token storage best practices
   - Common vulnerabilities

5. **Real-World Use Cases**
   - "Login with Google"
   - Mobile app authentication
   - Service-to-service auth
   - SPA authentication

## 📖 Flow Examples

### Authorization Code Flow

```
1. User → App → Auth Server
2. User authenticates
3. Auth Code → App
4. App exchanges code for tokens
5. Tokens → App
6. App → API (with access token)
```

### PKCE Flow

```
1. App generates code_verifier & code_challenge
2. App → Auth Server (with challenge)
3. User authenticates
4. Auth Code → App
5. App → Auth Server (code + verifier)
6. Server verifies PKCE
7. Tokens → App
```

### Client Credentials

```
1. Service → Auth Server (client_id + secret)
2. Access Token → Service
3. Service → API (with token)
```

## 🎨 Features Showcase

### Animated Flows

- Watch tokens move between actors
- See HTTP requests in real-time
- Understand the sequence visually

### Interactive Learning

- Click through each step
- Read detailed explanations
- Copy code examples

### Hands-On Tools

- Generate real PKCE values
- Inspect actual JWT tokens
- Build scope requests

## 🔒 Security Best Practices Included

### ✅ Recommended

- Use Authorization Code + PKCE for all public clients
- Validate redirect URIs strictly
- Use state parameter for CSRF protection
- Store tokens securely (httpOnly cookies)
- Short-lived access tokens (15min-1hr)

### ❌ Avoid

- Don't use Implicit Flow (deprecated)
- Don't use Password Grant (defeats OAuth purpose)
- Don't skip PKCE for mobile/SPA
- Don't store tokens in localStorage (XSS risk)
- Don't trust client-side validation alone

## 🎯 Use Cases Covered

1. **"Login with Google"**
   - Flow: Auth Code + PKCE
   - Scopes: openid, profile, email
   - Use case: Third-party authentication

2. **Mobile App Authorization**
   - Flow: Auth Code + PKCE (mandatory)
   - Why: No client secret in mobile apps
   - Security: PKCE prevents code interception

3. **Backend Service Integration**
   - Flow: Client Credentials
   - Why: No user involved
   - Use case: Service-to-service auth

4. **Single Page Application**
   - Flow: Auth Code + PKCE
   - Why: Browser-based, can't store secrets
   - Security: PKCE replaces client secret

## 🛠️ Tech Stack

- **Vanilla JavaScript** - No frameworks
- **Web Crypto API** - For PKCE generation
- **CSS Animations** - Smooth flow transitions
- **Glassmorphic Design** - Modern UI

## 📚 Related Projects

- [JWT Explainer](../jwt-explainer/) - Learn JSON Web Tokens
- Auth Academy (Coming) - Complete auth learning platform

## 🤝 Contributing

This is part of the Auth Academy project. Feedback and contributions welcome!

## 📝 License

MIT License - Free for educational use

---

**Part of Auth Academy** - Making authentication accessible to everyone 🚀
