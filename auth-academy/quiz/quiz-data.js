// Quiz Data - Questions for all topics

const quizData = {
    jwt: {
        title: 'JWT Fundamentals',
        questions: [
            {
                question: 'What does JWT stand for?',
                options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Token', 'Just Web Token'],
                correct: 1,
                explanation: 'JWT stands for JSON Web Token. It\'s a compact, URL-safe means of representing claims between two parties.'
            },
            {
                question: 'How many parts does a JWT have?',
                options: ['1', '2', '3', '4'],
                correct: 2,
                explanation: 'A JWT consists of 3 parts: Header, Payload, and Signature, separated by dots.'
            },
            {
                question: 'What encoding is used for JWT parts?',
                options: ['Base64', 'Base64URL', 'Hexadecimal', 'UTF-8'],
                correct: 1,
                explanation: 'JWT uses Base64URL encoding, which is URL-safe (replaces + with - and / with _).'
            },
            {
                question: 'What is the "alg" field in JWT header?',
                options: ['Alignment', 'Algorithm', 'Alias', 'Allocation'],
                correct: 1,
                explanation: 'The "alg" field specifies the signing algorithm used (e.g., HS256, RS256).'
            },
            {
                question: 'Which claim represents the token issuer?',
                options: ['sub', 'aud', 'iss', 'exp'],
                correct: 2,
                explanation: '"iss" (issuer) identifies the principal that issued the JWT.'
            },
            {
                question: 'What does "exp" claim represent?',
                options: ['Expected value', 'Expiration time', 'Experience level', 'Export flag'],
                correct: 1,
                explanation: '"exp" (expiration time) identifies when the JWT should no longer be accepted.'
            },
            {
                question: 'Is the JWT payload encrypted by default?',
                options: ['Yes', 'No', 'Only with RS256', 'Only with HS512'],
                correct: 1,
                explanation: 'No! The payload is only encoded (Base64URL), not encrypted. Anyone can decode it. Never put secrets in the payload.'
            },
            {
                question: 'What algorithm uses symmetric keys?',
                options: ['RS256', 'RS512', 'HS256', 'ES256'],
                correct: 2,
                explanation: 'HS256 (HMAC-SHA256) uses symmetric keys - the same secret for signing and verification.'
            },
            {
                question: 'Where should JWTs be stored in browsers?',
                options: ['localStorage', 'sessionStorage', 'HttpOnly Cookie', 'URL parameters'],
                correct: 2,
                explanation: 'HttpOnly cookies are recommended as they\'re not accessible via JavaScript, protecting against XSS attacks.'
            },
            {
                question: 'What is the recommended JWT expiration time?',
                options: ['1 day', '1 week', '15 minutes to 1 hour', '1 month'],
                correct: 2,
                explanation: '15 minutes to 1 hour is recommended. Use refresh tokens for longer sessions.'
            }
        ]
    },
    oauth: {
        title: 'OAuth 2.0',
        questions: [
            {
                question: 'What is OAuth 2.0 primarily used for?',
                options: ['Authentication', 'Authorization', 'Encryption', 'Compression'],
                correct: 1,
                explanation: 'OAuth 2.0 is an authorization framework. It grants access to resources, not identity verification.'
            },
            {
                question: 'Which grant type is recommended for SPAs?',
                options: ['Implicit', 'Password', 'Authorization Code + PKCE', 'Client Credentials'],
                correct: 2,
                explanation: 'Authorization Code + PKCE is the recommended flow for SPAs and mobile apps.'
            },
            {
                question: 'What does PKCE stand for?',
                options: ['Private Key Code Exchange', 'Proof Key for Code Exchange', 'Public Key Crypto Exchange', 'Protocol for Key Code Encryption'],
                correct: 1,
                explanation: 'PKCE (Proof Key for Code Exchange) protects against authorization code interception attacks.'
            },
            {
                question: 'Why is the Implicit flow deprecated?',
                options: ['Too complex', 'Token exposed in URL', 'Requires server', 'Too slow'],
                correct: 1,
                explanation: 'Implicit flow exposes the access token in the URL fragment, making it vulnerable to token leakage.'
            },
            {
                question: 'What is the purpose of the "state" parameter?',
                options: ['Store user location', 'Prevent CSRF attacks', 'Define token scope', 'Set expiration'],
                correct: 1,
                explanation: 'The state parameter prevents CSRF attacks by ensuring the response matches the request.'
            },
            {
                question: 'Which OAuth flow needs no user interaction?',
                options: ['Authorization Code', 'Implicit', 'Client Credentials', 'Device Code'],
                correct: 2,
                explanation: 'Client Credentials flow is for machine-to-machine auth, no user involvement.'
            },
            {
                question: 'What is a refresh token used for?',
                options: ['Refreshing the page', 'Getting new access tokens', 'Clearing the cache', 'Updating user profile'],
                correct: 1,
                explanation: 'Refresh tokens obtain new access tokens without requiring the user to re-authenticate.'
            },
            {
                question: 'What are "scopes" in OAuth?',
                options: ['Visual elements', 'Permission definitions', 'Token types', 'Server addresses'],
                correct: 1,
                explanation: 'Scopes define the permissions/access levels requested by the application.'
            },
            {
                question: 'Where should client secrets be stored?',
                options: ['In the frontend code', 'In localStorage', 'On the server only', 'In the URL'],
                correct: 2,
                explanation: 'Client secrets must only be stored on the server, never in client-side code.'
            },
            {
                question: 'What is the redirect_uri used for?',
                options: ['Logging out', 'Receiving auth responses', 'Storing tokens', 'Displaying errors'],
                correct: 1,
                explanation: 'The redirect_uri is where the authorization server sends the user after authentication.'
            }
        ]
    },
    security: {
        title: 'Auth Security',
        questions: [
            {
                question: 'What attack does HttpOnly cookies prevent?',
                options: ['SQL Injection', 'XSS', 'CSRF', 'Man-in-the-middle'],
                correct: 1,
                explanation: 'HttpOnly cookies are not accessible via JavaScript, preventing XSS attacks from stealing them.'
            },
            {
                question: 'What is a CSRF attack?',
                options: ['Injecting malicious scripts', 'Forging requests as a user', 'Brute force login', 'Session hijacking'],
                correct: 1,
                explanation: 'CSRF (Cross-Site Request Forgery) tricks users into executing unwanted actions while authenticated.'
            },
            {
                question: 'What minimum key length is recommended for HS256?',
                options: ['64 bits', '128 bits', '256 bits', '512 bits'],
                correct: 2,
                explanation: '256-bit keys are recommended for HS256 to ensure adequate security.'
            },
            {
                question: 'Why should tokens be sent over HTTPS only?',
                options: ['Faster transfer', 'Prevent interception', 'Browser requirement', 'Token format requirement'],
                correct: 1,
                explanation: 'HTTPS encrypts data in transit, preventing man-in-the-middle attacks from capturing tokens.'
            },
            {
                question: 'What is the "none" algorithm vulnerability?',
                options: ['Token has no expiry', 'Signature is skipped', 'No encryption used', 'No claims allowed'],
                correct: 1,
                explanation: 'The "none" algorithm attack skips signature verification, allowing forged tokens.'
            },
            {
                question: 'What is token rotation?',
                options: ['Encrypting tokens', 'Regularly replacing tokens', 'Switching algorithms', 'Moving token storage'],
                correct: 1,
                explanation: 'Token rotation issues new refresh tokens with each use, limiting stolen token validity.'
            },
            {
                question: 'Why validate tokens on every request?',
                options: ['Improve performance', 'Catch expired/revoked tokens', 'Compress data', 'Log activity'],
                correct: 1,
                explanation: 'Validation catches expired, revoked, or tampered tokens before granting access.'
            },
            {
                question: 'What is algorithm confusion attack?',
                options: ['Too many algorithms', 'Switching RS to HS attack', 'Encrypting wrong data', 'Using old algorithms'],
                correct: 1,
                explanation: 'Algorithm confusion tricks the server into using the public key as an HMAC secret.'
            },
            {
                question: 'What is the purpose of token binding?',
                options: ['Connect multiple tokens', 'Bind token to client', 'Merge old and new tokens', 'Link user accounts'],
                correct: 1,
                explanation: 'Token binding ties tokens to specific clients/devices, preventing theft.'
            },
            {
                question: 'What is a recommended practice for API keys?',
                options: ['Share across apps', 'Commit to Git', 'Rotate regularly', 'Use in URLs'],
                correct: 2,
                explanation: 'API keys should be rotated regularly and stored securely, never in code or URLs.'
            }
        ]
    }
};

// Mixed quiz pulls random questions from all topics
function generateMixedQuiz() {
    const allQuestions = [];
    Object.values(quizData).forEach(topic => {
        topic.questions.forEach(q => allQuestions.push(q));
    });

    // Shuffle and pick 10
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return {
        title: 'Mixed Challenge',
        questions: shuffled.slice(0, 10)
    };
}
