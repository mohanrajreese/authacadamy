// Auth Comparison Matrix - Interactive Filtering & Sorting

const authMethods = [
    {
        name: 'OAuth 2.0 + PKCE',
        icon: '🔐',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'moderate',
        bestFor: 'SPAs, Mobile Apps',
        useCases: ['web', 'mobile', 'api'],
        stateless: true,
        mobile: true,
        status: 'recommended',
        link: '../oauth-visualizer/index.html'
    },
    {
        name: 'JWT (JSON Web Tokens)',
        icon: '🎫',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'moderate',
        bestFor: 'APIs, Microservices',
        useCases: ['web', 'mobile', 'api', 'microservices'],
        stateless: true,
        mobile: true,
        status: 'recommended',
        link: '../jwt-explainer/index.html'
    },
    {
        name: 'Session-Based Auth',
        icon: '🍪',
        security: 'high',
        securityStars: '⭐⭐⭐⭐',
        complexity: 'simple',
        bestFor: 'Traditional Web Apps',
        useCases: ['web'],
        stateless: false,
        mobile: false,
        status: 'recommended',
        link: '../session-vs-token/index.html'
    },
    {
        name: 'API Keys',
        icon: '🔑',
        security: 'medium',
        securityStars: '⭐⭐⭐',
        complexity: 'simple',
        bestFor: 'Public APIs, Services',
        useCases: ['api', 'm2m'],
        stateless: true,
        mobile: false,
        status: 'recommended',
        link: '../api-key-security/index.html'
    },
    {
        name: 'OAuth Client Credentials',
        icon: '🤖',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'simple',
        bestFor: 'Machine-to-Machine',
        useCases: ['m2m', 'microservices'],
        stateless: true,
        mobile: false,
        status: 'recommended',
        link: '../oauth-visualizer/index.html'
    },
    {
        name: 'OpenID Connect (OIDC)',
        icon: '🆔',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'complex',
        bestFor: 'SSO, Identity',
        useCases: ['web', 'mobile'],
        stateless: true,
        mobile: true,
        status: 'recommended',
        link: null
    },
    {
        name: 'SAML 2.0',
        icon: '🏢',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'complex',
        bestFor: 'Enterprise SSO',
        useCases: ['web'],
        stateless: false,
        mobile: false,
        status: 'recommended',
        link: null
    },
    {
        name: 'mTLS (Mutual TLS)',
        icon: '🔒',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'complex',
        bestFor: 'Microservices, Zero Trust',
        useCases: ['microservices', 'm2m'],
        stateless: true,
        mobile: false,
        status: 'recommended',
        link: null
    },
    {
        name: 'Basic Auth',
        icon: '🔓',
        security: 'low',
        securityStars: '⭐⭐',
        complexity: 'simple',
        bestFor: 'Internal Tools',
        useCases: ['api'],
        stateless: true,
        mobile: true,
        status: 'deprecated',
        link: null
    },
    {
        name: 'Digest Auth',
        icon: '🧮',
        security: 'medium',
        securityStars: '⭐⭐⭐',
        complexity: 'moderate',
        bestFor: 'Legacy Systems',
        useCases: ['api'],
        stateless: true,
        mobile: false,
        status: 'deprecated',
        link: null
    },
    {
        name: 'OAuth Implicit Flow',
        icon: '⚠️',
        security: 'low',
        securityStars: '⭐⭐',
        complexity: 'simple',
        bestFor: 'NONE (Legacy)',
        useCases: ['web'],
        stateless: true,
        mobile: false,
        status: 'deprecated',
        link: '../oauth-visualizer/index.html'
    },
    {
        name: 'Password Grant',
        icon: '🔑',
        security: 'low',
        securityStars: '⭐⭐',
        complexity: 'simple',
        bestFor: 'NONE (Legacy)',
        useCases: [],
        stateless: true,
        mobile: false,
        status: 'deprecated',
        link: '../oauth-visualizer/index.html'
    },
    {
        name: 'LDAP Auth',
        icon: '📁',
        security: 'medium',
        securityStars: '⭐⭐⭐',
        complexity: 'complex',
        bestFor: 'Enterprise Directories',
        useCases: ['web'],
        stateless: false,
        mobile: false,
        status: 'recommended',
        link: null
    },
    {
        name: 'Kerberos',
        icon: '🐕',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'complex',
        bestFor: 'Windows/AD Environments',
        useCases: ['web'],
        stateless: false,
        mobile: false,
        status: 'recommended',
        link: null
    },
    {
        name: 'Certificate Auth (X.509)',
        icon: '📜',
        security: 'high',
        securityStars: '⭐⭐⭐⭐⭐',
        complexity: 'complex',
        bestFor: 'IoT, High Security',
        useCases: ['iot', 'm2m'],
        stateless: true,
        mobile: false,
        status: 'recommended',
        link: null
    }
];

let currentSort = { column: null, direction: 'asc' };

function init() {
    renderTable();

    // Filter listeners
    document.getElementById('filterUseCase').addEventListener('change', renderTable);
    document.getElementById('filterSecurity').addEventListener('change', renderTable);
    document.getElementById('filterComplexity').addEventListener('change', renderTable);
    document.getElementById('filterStatus').addEventListener('change', renderTable);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Sort listeners
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.sort));
    });

    console.log('📊 Comparison Matrix loaded');
}

function renderTable() {
    const useCase = document.getElementById('filterUseCase').value;
    const security = document.getElementById('filterSecurity').value;
    const complexity = document.getElementById('filterComplexity').value;
    const status = document.getElementById('filterStatus').value;

    let filtered = authMethods.filter(method => {
        if (useCase !== 'all' && !method.useCases.includes(useCase)) return false;
        if (security !== 'all' && method.security !== security) return false;
        if (complexity !== 'all' && method.complexity !== complexity) return false;
        if (status !== 'all' && method.status !== status) return false;
        return true;
    });

    // Sort
    if (currentSort.column) {
        filtered.sort((a, b) => {
            let valA = a[currentSort.column];
            let valB = b[currentSort.column];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = filtered.map(method => `
        <tr class="${method.status === 'deprecated' ? 'deprecated' : ''}">
            <td>
                <div class="method-name">
                    <span class="method-icon">${method.icon}</span>
                    <strong>${method.name}</strong>
                </div>
            </td>
            <td><span class="security-badge ${method.security}">${method.securityStars}</span></td>
            <td><span class="complexity-badge ${method.complexity}">${capitalize(method.complexity)}</span></td>
            <td>${method.bestFor}</td>
            <td>${method.stateless ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
            <td>${method.mobile ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
            <td>
                <span class="status-badge ${method.status}">
                    ${method.status === 'recommended' ? '✅ Recommended' : '⚠️ Deprecated'}
                </span>
            </td>
            <td>
                ${method.link
            ? `<a href="${method.link}" class="learn-link">Learn →</a>`
            : '<span class="text-muted">Coming</span>'}
            </td>
        </tr>
    `).join('');

    document.getElementById('resultsCount').textContent = `${filtered.length} method${filtered.length !== 1 ? 's' : ''}`;
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    renderTable();
}

function resetFilters() {
    document.getElementById('filterUseCase').value = 'all';
    document.getElementById('filterSecurity').value = 'all';
    document.getElementById('filterComplexity').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    currentSort = { column: null, direction: 'asc' };
    renderTable();
    showToast('🔄 Filters reset');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
