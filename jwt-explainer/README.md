# 🔐 JWT Explainer

An interactive, real-time JWT (JSON Web Token) visualizer that makes understanding JWTs accessible to anyone.

## ✨ Features

- **Live JWT Encoding/Decoding** - See changes in real-time as you edit
- **Visual Breakdown** - Color-coded Header (red), Payload (purple), and Signature (cyan)
- **Interactive Editors** - Edit JSON directly and see instant updates
- **Signature Verification** - Real HMAC-SHA256 signature generation and validation
- **Decode Any JWT** - Paste and analyze any JWT token
- **Security Best Practices** - Learn what to do and what to avoid
- **Beautiful Glassmorphic UI** - Modern, premium design with smooth animations
- **Keyboard Shortcuts** - `Cmd/Ctrl + K` to copy, `Cmd/Ctrl + Shift + R` to reset

## 🚀 Quick Start

Simply open `index.html` in your browser - no build process required!

```bash
# Option 1: Direct open
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## 📚 What You'll Learn

1. **JWT Structure** - Understanding the three parts: Header, Payload, Signature
2. **Base64URL Encoding** - How JWT encodes data
3. **HMAC Signing** - How signatures verify token integrity
4. **Claims** - Standard JWT claims (iss, sub, aud, exp, iat, nbf)
5. **Authentication Flow** - How JWTs are used in real applications
6. **Security** - Best practices and common pitfalls

## 🎨 How It Works

### Header
The header specifies the token type (JWT) and the signing algorithm (e.g., HS256, RS256).

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
The payload contains the claims - statements about the user and additional metadata.

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1735411241,
  "exp": 1735497641
}
```

### Signature
The signature is created by signing the encoded header and payload with a secret key:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## 🔒 Security Tips

### ✅ DO
- Use strong, random secret keys (256+ bits)
- Set short expiration times (15min - 1hr)
- Always validate signatures server-side
- Use HTTPS for all transmissions
- Use RS256 for distributed systems

### ❌ DON'T
- Store sensitive data in the payload (it's encoded, not encrypted!)
- Use weak or predictable secrets
- Store JWTs in localStorage (XSS vulnerable)
- Trust tokens without verification
- Use algorithm "none" in production

## 🛠️ Tech Stack

- **Vanilla JavaScript** - No frameworks, pure Web APIs
- **Web Crypto API** - For HMAC-SHA256 signing
- **CSS Custom Properties** - For theming
- **Glassmorphism** - Modern UI design

## 📖 Educational Use Cases

- **Teaching** - Explain JWTs to students or team members
- **Debugging** - Decode and inspect JWTs during development
- **Learning** - Understand how authentication tokens work
- **Testing** - Generate test tokens for your applications

## 🎯 Browser Support

Works in all modern browsers that support:
- ES6+ (async/await, arrow functions)
- Web Crypto API
- CSS Custom Properties
- CSS Grid & Flexbox

## 📝 License

MIT License - Feel free to use this for educational purposes!

## 🙏 Acknowledgments

Inspired by [jwt.io](https://jwt.io) and built to make JWT education more interactive and accessible.

---

**Built with ❤️ to make JWT understandable for everyone**
