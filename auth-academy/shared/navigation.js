// Cross-Tool Navigation - Smart breadcrumbs and related tools
// Usage: Include in all tools, automatically detects context

class NavigationManager {
    constructor() {
        this.tools = {
            'jwt-explainer': {
                name: 'JWT Explainer',
                icon: '🎫',
                path: '/jwt-explainer/index.html',
                related: ['oauth-visualizer', 'session-vs-token'],
                description: 'Decode and encode JSON Web Tokens'
            },
            'oauth-visualizer': {
                name: 'OAuth 2.0 Visualizer',
                icon: '🔐',
                path: '/oauth-visualizer/index.html',
                related: ['jwt-explainer', 'api-key-security', 'auth-decision-tree'],
                description: 'Watch OAuth flows animate step-by-step'
            },
            'session-vs-token': {
                name: 'Session vs Token',
                icon: '⚖️',
                path: '/auth-academy/session-vs-token/index.html',
                related: ['jwt-explainer', 'oauth-visualizer'],
                description: 'Compare session and token authentication'
            },
            'api-key-security': {
                name: 'API Key Security',
                icon: '🔑',
                path: '/auth-academy/api-key-security/index.html',
                related: ['oauth-visualizer', 'auth-decision-tree'],
                description: 'Generate secure API keys and scan for vulnerabilities'
            },
            'auth-decision-tree': {
                name: 'Auth Decision Tree',
                icon: '🌲',
                path: '/auth-academy/auth-decision-tree/index.html',
                related: ['jwt-explainer', 'oauth-visualizer', 'session-vs-token'],
                description: 'Find the perfect auth method for your project'
            },
            'hub': {
                name: 'Auth Academy',
                icon: '🏠',
                path: '/auth-academy/index.html',
                related: [],
                description: 'Learn authentication with interactive tools'
            }
        };

        this.currentTool = this.detectCurrentTool();
    }

    detectCurrentTool() {
        const path = window.location.pathname;

        if (path.includes('jwt-explainer')) return 'jwt-explainer';
        if (path.includes('oauth-visualizer')) return 'oauth-visualizer';
        if (path.includes('session-vs-token')) return 'session-vs-token';
        if (path.includes('api-key-security')) return 'api-key-security';
        if (path.includes('auth-decision-tree')) return 'auth-decision-tree';
        if (path.includes('auth-academy')) return 'hub';

        return 'hub';
    }

    createBreadcrumbs() {
        const current = this.tools[this.currentTool];
        if (!current) return null;

        const breadcrumbs = document.createElement('div');
        breadcrumbs.className = 'breadcrumbs';
        breadcrumbs.innerHTML = `
            <a href="${this.getBasePath()}/auth-academy/index.html" class="breadcrumb-item">
                <span>${this.tools.hub.icon}</span>
                <span>Home</span>
            </a>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-item current">
                <span>${current.icon}</span>
                <span>${current.name}</span>
            </span>
        `;

        return breadcrumbs;
    }

    createRelatedTools() {
        const current = this.tools[this.currentTool];
        if (!current || !current.related.length) return null;

        const container = document.createElement('div');
        container.className = 'related-tools';

        const relatedHTML = current.related.map(toolId => {
            const tool = this.tools[toolId];
            if (!tool) return '';

            return `
                <a href="${this.getBasePath()}${tool.path}" class="related-tool-card">
                    <div class="related-tool-icon">${tool.icon}</div>
                    <div class="related-tool-info">
                        <h4>${tool.name}</h4>
                        <p>${tool.description}</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            `;
        }).join('');

        container.innerHTML = `
            <h3>🔗 Related Tools</h3>
            <div class="related-tools-grid">
                ${relatedHTML}
            </div>
        `;

        return container;
    }

    getBasePath() {
        // Detect if we're in a subdirectory
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        return depth > 1 ? '../'.repeat(depth - 1) : '.';
    }

    insertBreadcrumbs() {
        const header = document.querySelector('.header') || document.querySelector('header');
        if (!header) return;

        const breadcrumbs = this.createBreadcrumbs();
        if (!breadcrumbs) return;

        // Insert after header
        header.insertAdjacentElement('afterend', breadcrumbs);
    }

    insertRelatedTools() {
        const footer = document.querySelector('.footer') || document.querySelector('footer');
        if (!footer) return;

        const relatedTools = this.createRelatedTools();
        if (!relatedTools) return;

        // Insert before footer
        footer.insertAdjacentElement('beforebegin', relatedTools);
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.insertBreadcrumbs();
                this.insertRelatedTools();
            });
        } else {
            this.insertBreadcrumbs();
            this.insertRelatedTools();
        }
    }
}

// Auto-initialize
const navManager = new NavigationManager();
navManager.init();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
