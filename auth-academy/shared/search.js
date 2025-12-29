// Global Search - Search across all Auth Academy tools
// Keyboard shortcut: Cmd/Ctrl + K

class SearchManager {
    constructor() {
        this.isOpen = false;
        this.searchIndex = this.buildSearchIndex();
        this.init();
    }

    buildSearchIndex() {
        return [
            // JWT Explainer
            { title: 'JWT Explainer', category: 'Tool', url: '/jwt-explainer/index.html', keywords: ['jwt', 'json', 'web', 'token', 'encode', 'decode', 'sign', 'verify'], description: 'Decode, encode, and understand JSON Web Tokens' },
            { title: 'HS256 Algorithm', category: 'JWT', url: '/jwt-explainer/index.html', keywords: ['hmac', 'sha256', 'symmetric', 'secret'], description: 'HMAC with SHA-256 signing algorithm' },
            { title: 'RS256 Algorithm', category: 'JWT', url: '/jwt-explainer/index.html', keywords: ['rsa', 'sha256', 'asymmetric', 'public', 'private', 'key'], description: 'RSA with SHA-256 signing algorithm' },
            { title: 'JWT Structure', category: 'JWT', url: '/jwt-explainer/index.html', keywords: ['header', 'payload', 'signature', 'claims'], description: 'Understanding JWT structure: header.payload.signature' },

            // OAuth Visualizer
            { title: 'OAuth 2.0 Visualizer', category: 'Tool', url: '/oauth-visualizer/index.html', keywords: ['oauth', 'authorization', 'oauth2', 'flow', 'grant'], description: 'Interactive OAuth 2.0 flow animations' },
            { title: 'Authorization Code Flow', category: 'OAuth', url: '/oauth-visualizer/index.html', keywords: ['auth code', 'redirect', 'callback', 'web app'], description: 'Most secure OAuth flow for web applications' },
            { title: 'PKCE Flow', category: 'OAuth', url: '/oauth-visualizer/index.html', keywords: ['pkce', 'proof key', 'mobile', 'spa', 'code challenge'], description: 'OAuth with Proof Key for Code Exchange' },
            { title: 'Client Credentials', category: 'OAuth', url: '/oauth-visualizer/index.html', keywords: ['machine', 'm2m', 'service', 'backend'], description: 'Machine-to-machine OAuth flow' },

            // Session vs Token
            { title: 'Session vs Token', category: 'Tool', url: '/auth-academy/session-vs-token/index.html', keywords: ['session', 'token', 'compare', 'stateful', 'stateless'], description: 'Compare session-based and token-based authentication' },
            { title: 'Session Authentication', category: 'Concept', url: '/auth-academy/session-vs-token/index.html', keywords: ['cookie', 'server', 'state', 'redis'], description: 'Server-side session management' },
            { title: 'Token Authentication', category: 'Concept', url: '/auth-academy/session-vs-token/index.html', keywords: ['jwt', 'stateless', 'scalable'], description: 'Client-side token authentication' },

            // API Key Security
            { title: 'API Key Security', category: 'Tool', url: '/auth-academy/api-key-security/index.html', keywords: ['api key', 'generator', 'security', 'vulnerability'], description: 'Generate secure API keys and scan for vulnerabilities' },
            { title: 'API Key Generator', category: 'Feature', url: '/auth-academy/api-key-security/index.html', keywords: ['generate', 'random', 'secure', 'entropy'], description: 'Create cryptographically secure API keys' },
            { title: 'Vulnerability Scanner', category: 'Feature', url: '/auth-academy/api-key-security/index.html', keywords: ['scan', 'detect', 'hardcoded', 'leak'], description: 'Find exposed API keys in code' },

            // Decision Tree
            { title: 'Auth Decision Tree', category: 'Tool', url: '/auth-academy/auth-decision-tree/index.html', keywords: ['decide', 'choose', 'which', 'recommendation', 'wizard'], description: 'Find the perfect auth method for your project' },

            // Concepts
            { title: 'CSRF Protection', category: 'Security', url: '/auth-academy/session-vs-token/index.html', keywords: ['csrf', 'cross site', 'token', 'security'], description: 'Cross-Site Request Forgery protection' },
            { title: 'XSS Protection', category: 'Security', url: '/jwt-explainer/index.html', keywords: ['xss', 'cross site scripting', 'httponly'], description: 'Cross-Site Scripting prevention' },
            { title: 'Refresh Tokens', category: 'OAuth', url: '/oauth-visualizer/index.html', keywords: ['refresh', 'rotation', 'long term'], description: 'Long-lived tokens for token renewal' },
            { title: 'Access Tokens', category: 'OAuth', url: '/oauth-visualizer/index.html', keywords: ['access', 'short lived', 'bearer'], description: 'Short-lived tokens for API access' }
        ];
    }

    init() {
        this.createSearchUI();
        this.setupKeyboardShortcut();
    }

    createSearchUI() {
        const overlay = document.createElement('div');
        overlay.id = 'searchOverlay';
        overlay.className = 'search-overlay hidden';
        overlay.innerHTML = `
            <div class="search-modal">
                <div class="search-input-container">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="searchInput" placeholder="Search Auth Academy..." autocomplete="off">
                    <kbd class="keyboard-hint">ESC</kbd>
                </div>
                <div class="search-results" id="searchResults">
                    <div class="search-hint">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                        <p>Type to search across all tools, examples, and concepts...</p>
                    </div>
                </div>
                <div class="search-footer">
                    <div class="search-shortcuts">
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Open</span>
                        <span><kbd>ESC</kbd> Close</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        const input = document.getElementById('searchInput');
        input.addEventListener('input', (e) => this.handleSearch(e.target.value));
        input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            // ESC
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    handleSearch(query) {
        const results = document.getElementById('searchResults');

        if (!query.trim()) {
            results.innerHTML = `
                <div class="search-hint">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4M12 8h.01"></path>
                    </svg>
                    <p>Type to search across all tools, examples, and concepts...</p>
                </div>
            `;
            return;
        }

        const filtered = this.searchIndex.filter(item => {
            const searchText = query.toLowerCase();
            return item.title.toLowerCase().includes(searchText) ||
                item.description.toLowerCase().includes(searchText) ||
                item.keywords.some(kw => kw.includes(searchText));
        }).slice(0, 10); // Limit to 10 results

        if (filtered.length === 0) {
            results.innerHTML = `
                <div class="no-results">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }

        results.innerHTML = filtered.map((item, index) => `
            <a href="${this.getBasePath()}${item.url}" class="search-result ${index === 0 ? 'selected' : ''}">
                <div class="result-category">${item.category}</div>
                <div class="result-content">
                    <h4>${this.highlightMatch(item.title, query)}</h4>
                    <p>${this.highlightMatch(item.description, query)}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </a>
        `).join('');
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    handleKeyDown(e) {
        const results = Array.from(document.querySelectorAll('.search-result'));
        if (!results.length) return;

        const selected = document.querySelector('.search-result.selected');
        let index = results.indexOf(selected);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            index = (index + 1) % results.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            index = (index - 1 + results.length) % results.length;
        } else if (e.key === 'Enter' && selected) {
            window.location.href = selected.href;
            return;
        } else {
            return;
        }

        results.forEach(r => r.classList.remove('selected'));
        results[index].classList.add('selected');
        results[index].scrollIntoView({ block: 'nearest' });
    }

    getBasePath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        return depth > 1 ? '../'.repeat(depth - 1) : '.';
    }

    open() {
        this.isOpen = true;
        const overlay = document.getElementById('searchOverlay');
        overlay.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('searchInput').focus();
        }, 100);
    }

    close() {
        this.isOpen = false;
        document.getElementById('searchOverlay').classList.add('hidden');
        document.getElementById('searchInput').value = '';
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }
}

// Auto-initialize
const searchManager = new SearchManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}
